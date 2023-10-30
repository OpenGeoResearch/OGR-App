<!--
    Copyright (C) 2023 Geodätisches Institut RWTH Aachen University,
    Mies-van-der-Rohe-Straße 1, D 52074 Aachen, Germany.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <v-row no-gutters>
    <v-container class="pa-0 ma-0">
      <permission-dialog
        v-if="dialog"
        :title="$t('permission_geolocation_title')"
        :text="$t('permission_geolocation_text_explore')"
        :demand="$t('permission_geolocation_demand')"
        :allow="$t('permission_geolocation_allow')"
        @change-permission-allow="setPermissionGeolocation(true)"
        @change-permission-deny="setPermissionGeolocation(false)"
      />

      <forum-dialog :active="forum" @click-dialog-close="forum = false">
        <forum-content
          v-if="forum"
          :question="question.name"
          :description="question.description"
          :category="classification(question.category)"
          :images="question.images"
          :question-id="question.id"
          @click-show-series="forum = false"
        />
      </forum-dialog>

      <explore-filter-dialog :active="filter" @click-dialog-close="filter = false" @click-dialog-check="filter = false">
        <explore-filter-tags />
        <explore-filter-category class="mt-2" />
        <explore-filter-layer />
        <v-btn class="mt-2" width="100%" @click="removeFilters">
          {{ $t('explore_filter_remove') }}
        </v-btn>
      </explore-filter-dialog>

      <Map
        :selectable="true"
        @selectedFeatures="onFeaturesSelected($event)"
        @select="onSelect($event)"
      >
        <template #style>
          <vl-style>
            <vl-style-icon
              src="/marker_primary.png"
              color="#FFFFFF"
              :scale="0.6"
              :anchor="[0.5, 1]"
            />
          </vl-style>
        </template>
        <template #overlay="select">
          <vl-overlay
            v-for="feature in select.features"
            :id="feature.id"
            :key="feature.id"
            :position="$findPointOnSurface(feature.geometry)"
          />
        </template>
      </Map>

      <v-btn
        class="mb-9 mr-1 fixedBtnLocation"
        absolute
        bottom
        right
        fab
        large
        color="info"
        @click="update = !update"
      >
        <v-icon>{{ update ? mdiCrosshairsGps : mdiCrosshairsOff }}</v-icon>
      </v-btn>
      <v-btn
        class="mb-9 mr-1 fixedBtnFilter"
        absolute
        bottom
        right
        fab
        large
        color="primary"
        @click="filter = true"
      >
        <v-icon>{{ mdiFilter }}</v-icon>
      </v-btn>

      <info-snackbar
        :show="snackbar"
        :message="message"
        @close-manual="snackbar = false"
        @close-auto="snackbar = false"
      />
    </v-container>
  </v-row>
</template>

<script>
import { mdiCrosshairsGps, mdiCrosshairsOff, mdiFilter } from '@mdi/js'
import { mapState } from 'vuex'
import { createEmpty, extend } from 'ol/extent'
import { Fill, Stroke } from 'ol/style'
import Map from '~/components/map/MapExplore'
import { createSTASource, createStyleFunc, getCategoryFromCode, createSTASeriesSource } from '@/util/ogr-utils'
import ForumDialog from '~/components/forum/ForumDialog'
import ForumContent from '~/components/forum/ForumContent'
import InfoSnackbar from '~/components/info/InfoSnackbar'
import PermissionDialog from '~/components/dialog/PermissionDialog'
import ExploreFilterTags from '~/components/explore/ExploreFilterTags'
import ExploreFilterDialog from '~/components/explore/ExploreFilterDialog'
import ExploreFilterCategory from '~/components/explore/ExploreFilterCategrory'
import ExploreFilterLayer from '~/components/explore/ExploreFilterLayer'

export default {
  components: {
    ExploreFilterLayer,
    ExploreFilterCategory,
    ExploreFilterDialog,
    ExploreFilterTags,
    PermissionDialog,
    InfoSnackbar,
    ForumContent,
    ForumDialog,
    Map
  },
  data () {
    return {
      mdiCrosshairsGps,
      mdiCrosshairsOff,
      mdiFilter,
      ogrHpUrl: this.$config.ogrHpUrl,
      ogrStaUrl: this.$config.ogrStaUrl,
      map: undefined,
      question: {
        name: '',
        description: '',
        category: 0,
        images: [],
        id: null
      },
      snackbar: false,
      message: '',
      permission: {
        geolocation: false
      },
      dialog: false,
      forum: false,
      update: false,
      filter: false,
      drawer: null
    }
  },
  computed: {
    ...mapState('map', ['rotation', 'EPSG', 'zoom', 'center', 'selectedFeatures'])
  },
  watch: {
    update () {
      if (this.update) {
        this.showSnackbar(this.$t('explore_message_auto_location_active'))
        this.trackPosition()
      } else {
        this.showSnackbar(this.$t('explore_message_auto_location_inactive'))
        this.unregisterPositionWatcher()
      }
    },
    info () {
      this.checkPermission()
    }
  },

  created () {
    this.map = 'ogr'
    const mapconfig = require('@/static/mapconfig.json')
    this.$store.commit('map/initStore', mapconfig)
    this.$store.commit('layers/initStore', mapconfig)
    this.$store.commit('layers/addLayer', {
      id: 'OGR',
      title: 'OpenGeoResearch',
      cmp: 'vl-layer-vector',
      visible: true,
      selectable: true,
      opacity: 1,
      maxResolution: 17,
      source: createSTASource({
        cmp: 'vl-source-vector',
        url: this.$config.ogrStaUrl + '/FROST-Server/v1.1/Datastreams'
      }),
      style: [
        {
          cmp: 'vl-style',
          styles: {
            'vl-style-icon': {
              src: '/marker_secondary.png',
              scale: 0.42,
              anchor: [0.5, 1]
            }
          }
        }
      ]
    })
    this.$store.commit('layers/addLayer', {
      id: 'OGR_Cluster',
      title: 'Cluster',
      cmp: 'vl-layer-vector',
      visible: true,
      selectable: true,
      minResolution: 17,
      source: {
        cmp: 'vl-source-cluster',
        distance: 100,
        source: createSTASource({
          cmp: 'vl-source-vector',
          url: this.$config.ogrStaUrl + '/FROST-Server/v1.1/Datastreams'
        })
      },
      style: [createStyleFunc({
        cmp: 'vl-style-func',
        config: {
          image: {
            icon: {
              src: '/marker_secondary_cluster.png',
              scale: 0.42,
              anchor: [
                0.33,
                1
              ]
            }
          },
          text: {
            ':text': '$size',
            font: 'bold 15px sans-serif',
            textAlign: 'center',
            textBaseline: 'middle',
            offsetX: '19',
            offsetY: '-53',
            fill: new Fill({
              color: 'white'
            }),
            stroke: new Stroke({
              color: 'black'
            })
          }
        }
      })
      ]
    })
    this.$store.commit('layers/addLayer', {
      id: 'OGR_Series',
      title: 'OpenGeoResearch Series',
      cmp: 'vl-layer-vector',
      visible: false,
      selectable: true,
      opacity: 1,
      maxResolution: 17,
      source: createSTASeriesSource({
        cmp: 'vl-source-vector',
        url: this.$config.ogrStaUrl + '/FROST-Server/v1.1/Datastreams'
      }),
      style: [
        {
          cmp: 'vl-style',
          styles: {
            'vl-style-icon': {
              src: '/marker_info.png',
              scale: 0.42,
              anchor: [0.5, 1]
            }
          }
        }
      ]
    })
    this.$store.commit('layers/addLayer', {
      id: 'OGR_Series_Cluster',
      title: 'OpenGeoResearch Series Cluster',
      cmp: 'vl-layer-vector',
      visible: false,
      selectable: true,
      minResolution: 17,
      source: {
        cmp: 'vl-source-cluster',
        distance: 100,
        source: createSTASeriesSource({
          cmp: 'vl-source-vector',
          url: this.$config.ogrStaUrl + '/FROST-Server/v1.1/Datastreams'
        })
      },
      style: [createStyleFunc({
        cmp: 'vl-style-func',
        config: {
          image: {
            icon: {
              src: '/marker_info_cluster.png',
              scale: 0.42,
              anchor: [
                0.33,
                1
              ]
            }
          },
          text: {
            ':text': '$size',
            font: 'bold 15px sans-serif',
            textAlign: 'center',
            textBaseline: 'middle',
            offsetX: '19',
            offsetY: '-53',
            fill: new Fill({
              color: 'white'
            }),
            stroke: new Stroke({
              color: 'black'
            })
          }
        }
      })
      ]
    })
  },
  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_explore'))
    window.addEventListener('popstate', this.onArrowBackAction)
  },
  mounted () {
    this.checkPermission()
    this.setPosition()
  },
  beforeDestroy () {
    window.removeEventListener('popstate', this.onArrowBackAction)
    this.unregisterPositionWatcher()
    this.removeFilters()
  },
  methods: {
    onArrowBackAction () {
      if (this.forum) {
        if (this.input) {
          this.$nuxt.$emit('close-forum-input-dialog')
        } else {
          this.$nuxt.$emit('close-forum-dialog')
        }
      } else if (this.filter) {
        this.$nuxt.$emit('close-explore-filter-dialog')
      } else {
        this.$nuxt.$emit('arrow-back-navigation')
      }
    },
    checkPermission () {
      if (this.info === false) {
        if (window.localStorage.getItem('geolocation-permission') === 'true') {
          this.permission.geolocation = true
        } else {
          this.dialog = true
        }
      }
    },
    setPermissionGeolocation (val) {
      window.localStorage.setItem('geolocation-permission', val)
      this.permission.geolocation = val
      this.dialog = false
      if (val === true) {
        this.setPosition()
      }
    },
    setPosition () {
      if (this.permission.geolocation === true) {
        if (navigator.geolocation) {
          this.navigatorId = navigator.geolocation.getCurrentPosition(this.setPositionSuccess, this.setPositionError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        } else {
          this.showSnackbar(this.$t('geo_location_not_supported'))
        }
      }
    },
    trackPosition () {
      if (this.permission.geolocation === true) {
        if (navigator.geolocation) {
          this.navigatorId = navigator.geolocation.watchPosition(this.trackPositionSuccess, this.trackPositionError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        } else {
          this.showSnackbar(this.$t('geo_location_not_supported'))
        }
      }
    },
    setPositionSuccess (locPosition) {
      this.setMapCenter([locPosition.coords.longitude, locPosition.coords.latitude])
      this.setMapZoom(15)
    },
    trackPositionSuccess (locPosition) {
      this.setMapCenter([locPosition.coords.longitude, locPosition.coords.latitude])
    },
    setPositionError () {
      this.setMapCenter([6.0786284, 50.7874583])
      this.setMapZoom(14)
      this.showSnackbar(this.$t('geo_location_deactivated'))
    },
    trackPositionError () {},
    unregisterPositionWatcher () {
      navigator.geolocation.clearWatch(this.navigatorId)
    },
    setMapZoom (zoom) {
      this.$store.commit('map/setMapZoom', zoom)
    },
    setMapCenter (center) {
      this.$store.commit('map/setMapCenter', center)
    },
    removeFilters () {
      this.$store.commit('ogr/resetFilters')
      this.$nuxt.$emit('updateLayer', 'OGR')
      this.$nuxt.$emit('updateLayer', 'OGR_Cluster')
      this.$nuxt.$emit('updateLayer', 'OGR_Series')
      this.$nuxt.$emit('updateLayer', 'OGR_Series_Cluster')
    },
    showSnackbar (message) {
      this.snackbar = false
      this.message = message
      this.snackbar = true
    },
    onFeaturesSelected (features) {
      if (features.length > 0) {
        // features selected
        // check for cluster or individual feature
        if ('features' in features[0].properties) {
          // cluster
        } else {
          // individual
          this.loadQuestion(features[0])
        }
      }
    },
    onSelect (event) {
      if (event.feature.get('features') !== undefined) {
        // handle click on cluster
        const features = event.feature.get('features')
        const extent = createEmpty()
        features.forEach(function (feature) {
          extend(extent, feature.getGeometry().getExtent())
        })
        this.$nuxt.$emit('zoomToExtent', extent)
        this.$nuxt.$emit('unselectAll')
      }
    },
    classification (category) {
      return getCategoryFromCode(category, this.$i18n.locale)
    },
    loadQuestion (feature) {
      this.question.name = feature.properties.name
      this.question.description = feature.properties.description
      this.question.category = feature.properties['unitOfMeasurement/symbol']
      this.question.images = []
      for (let i = 0; true; i++) {
        const item = 'properties/images/' + i
        if (feature.properties[item]) {
          this.question.images.push(feature.properties[item])
        } else {
          break
        }
      }
      this.question.id = feature.properties.id.toString()
      this.forum = true
    }
  }
}

</script>

<style scoped>

.sta-overlay {
  position: absolute;
  left: -50px;
  bottom: 12px;
  width: 40em;
  max-width: 800em;
}
.fixedBtnFilter {
  position: fixed;
  right: 10px;
  top: calc(100vh - 145px);
}
.fixedBtnLocation {
  position: fixed;
  right: 10px;
  top: calc(100vh - 145px - 64px - 20px);
}
</style>
