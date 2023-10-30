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
  <div>
    <vl-map
      ref="map"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      :data-projection="'EPSG:' + EPSG"
      :style="style"
    >
      <vl-view
        :zoom="zoom"
        :center="center"
        :rotation="rotation"
      />

      <select-tool
        v-if="selectable"
        :map="mapRef"
        @updateLayer="reloadLayer($event)"
        @selectedFeatures="$emit('selectedFeatures', $event)"
        @select="$emit('select', $event)"
        @unselect="$emit('unselect', $event)"
      >
        <template #style>
          <slot name="style" />
        </template>
        <template #overlay="select">
          <slot
            name="overlay"
            :features="select.features"
          />
        </template>
      </select-tool>

      <vl-layer-tile
        v-for="layer in baseLayers.layers"
        :id="layer.name"
        :key="layer.name"
        :visible="(baseLayers.active === layer.id) && baseLayers.visible"
        :opacity="baseLayers.opacity"
      >
        <component
          :is="'vl-source-' + layer.id"
          v-bind="layer"
        />
      </vl-layer-tile>

      <component
        :is="layer.cmp"
        v-for="layer in layers"
        :key="layer.id"
        v-bind="layer"
        :visible="layer.visible"
        :z-index="layer.zIndex"
        :opacity="layer.opacity"
      >
        <template v-if="layer.cmp === 'vl-layer-group'">
          <component
            :is="ingroup_layer.cmp"
            v-for="ingroup_layer in layer.layers"
            :key="ingroup_layer.id"
            :z-index="ingroup_layer.zIndex"
            v-bind="ingroup_layer"
            :visible="ingroup_layer.visible"
            :opacity="layer.opacity"
          >
            <component
              :is="ingroup_layer.source.cmp"
              v-bind="ingroup_layer.source"
            />
          </component>
        </template>

        <template v-else>
          <template v-if="layer.source.cmp === 'vl-source-cluster'">
            <component
              :is="layer.source.cmp"
              v-bind="layer.source"
            >
              <component
                :is="layer.source.source.cmp"
                v-bind="layer.source.source"
              />
            </component>
          </template>

          <template v-else-if="layer.source.type === 'wfs' || layer.source.type === 'sta'">
            <component
              :is="layer.source.cmp"
              :url="layer.source.url"
              v-bind="layer.source"
              :loading-strategy="layer.source.loadingStrategyFactory"
            />
          </template>
          <template v-else>
            <component
              :is="layer.source.cmp"
              v-bind="layer.source"
            />
          </template>
          <template v-if="layer.style">
            <component
              :is="style.cmp"
              v-for="(style, i) in layer.style"
              :key="i"
              v-bind="style"
            >
              <template v-if="style.styles">
                <component
                  :is="cmp"
                  v-for="(st, cmp) in style.styles"
                  :key="cmp"
                  v-bind="st"
                />
              </template>
            </component>
          </template>
        </template>
      </component>
    </vl-map>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import SelectTool from '@/components/map/SelectTool'

export default {
  components: {
    Vue,
    SelectTool
  },
  props: {
    // eslint-disable-next-line vue/require-prop-type-constructor,vue/require-default-prop
    selectable: true
  },
  data () {
    return {
      clickCoordinate: undefined,
      mapRef: {},
      style: '',
      ogrStaUrl: this.$config.ogrStaUrl
    }
  },
  computed: {
    ...mapState('layers', ['baseLayers', 'layers']),
    ...mapState('map', ['rotation', 'EPSG', 'zoom', 'center']),
    ...mapState('ogr', ['selectedQuestion'])
  },
  created () {
    // triggered from SelectTool in $nuxt
    this.$nuxt.$on('updateLayer', (layerId, zoomToExtent) => {
      this.reloadLayer(layerId, zoomToExtent)
    })
    this.$nuxt.$on('zoomToExtent', (extent) => {
      this.zoomToExtent(extent)
    })
    this.$nuxt.$on('centerMap', (center) => {
      this.setMapCenter(center)
    })
    this.$nuxt.$on('zoomToCoordinates', (coordinates) => {
      this.zoomToCoordinates(coordinates)
    })
    this.$nuxt.$on('setLayerVisibility', (layerId, visible) => {
      this.setLayerVisibility(layerId, visible)
    })
  },
  beforeMount () {
    this.style = this.createStyle()
  },
  mounted () {
    this.mapRef = this.$refs.map
    this.mapRef.$once('rendercomplete', (evt) => {
      this.$nuxt.$emit('mapinitcomplete')
      setTimeout(() => this.checkSeriesDisplay(), 500)
    })
  },
  beforeDestroy () {
    this.$nuxt.$off('updateLayer')
    this.$nuxt.$off('zoomToExtent')
    this.$nuxt.$off('centerMap')
    this.$nuxt.$off('zoomToCoordinates')
    this.$nuxt.$off('setLayerVisibility')
  },
  methods: {
    checkSeriesDisplay () {
      const id = window.localStorage.getItem('series-display-id')
      const tag = window.localStorage.getItem('series-display-tag')
      if (id && id !== 'false' && id !== '' && id !== 'null') {
        this.$axios.get(this.ogrStaUrl + '/FROST-Server/v1.1/Datastreams(' + id + ')')
          .then((response) => {
            this.$nuxt.$store.commit('ogr/setSelectedQuestion', response.data)
            this.setMapCenter(this.selectedQuestion.observedArea.coordinates)
            this.setMapZoom(15)

            if (tag) {
              this.$store.commit('ogr/addTag', tag)
              this.$store.commit('ogr/setSelectedSeries', tag)
              this.setLayerVisibility('OGR_Series', true)
              this.setLayerVisibility('OGR_Series_Cluster', true)
            }
            window.localStorage.setItem('series-display-id', null)
            window.localStorage.setItem('series-display-tag', null)
          })
      }
    },
    setLayerVisibility (layerId, visible) {
      console.log('set: ' + layerId + ' to ' + visible)
      console.log(this.mapRef.$map)
      if (this.mapRef.$map !== undefined) {
        const layer = this.mapRef.$map.getLayers().getArray().find(item => item.values_.id === layerId)
        console.log(layer)
        if (layer) {
          layer.setVisible(visible)
          this.$store.commit('ogr/setSeriesLayersVisible', visible)
        }
      }
    },
    createStyle () {
      const height = '' + window.innerHeight - 92 + 'px'
      let opacity = ''
      if (this.$vuetify.theme.dark) {
        opacity = '0.9'
      }
      return 'height: ' + height + '; opacity: ' + opacity + ';'
    },
    reloadLayer (layerId, zoomToExtent) {
      if (this.mapRef.$map !== undefined) {
        const layer = this.mapRef.$map.getLayers().getArray().find(item => item.values_.id === layerId)
        if (layer !== undefined) {
          let source = layer.getSource()
          if (source.source !== undefined) {
            source = source.getSource()
          }
          if (zoomToExtent) {
            source.once('featuresloaded', () => {
              setTimeout(() => this.zoomToExtent(source.getExtent()), 500)
            })
          }
          source.refresh()
        }
      }
    },
    zoomToExtent (extent) {
      if (this.mapRef.$map !== undefined) {
        this.mapRef.$map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50], maxZoom: 17 })
      }
    },
    setMapCenter (center) {
      this.$store.commit('map/setMapCenter', center)
    },
    setMapZoom (zoom) {
      this.$store.commit('map/setMapZoom', zoom)
    },
    zoomToCoordinates (coordinates) {
      this.zoomToExtent(new Point(fromLonLat(coordinates)))
    }
  }
}
</script>

<style>

</style>
