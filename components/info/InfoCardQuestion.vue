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
  <v-card
    v-ripple="false"
    class="mb-2"
  >
    <forum-dialog :active="forum" @click-dialog-close="closeForumDialog">
      <forum-content
        :question="name"
        :description="description"
        :category="classification(category)"
        :images="images"
        :question-id="id"
        @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
        @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
      />
    </forum-dialog>

    <forum-dialog :active="map" @click-dialog-close="closeMapDialog">
      <info-map :coords="coords" />
    </forum-dialog>

    <v-list-item>
      <v-list-item-avatar
        tile
        size="80"
        color="placeholder"
      >
        <v-img v-if="images.length > 0" :src="preview(images[0])" @click="showMediaDisplay(0)" />
        <v-img v-else src="/ogr_placeholder_2.png" />
      </v-list-item-avatar>
      <v-list-item-content class="mx-0" @click="toggle">
        <v-list-item-title class="title" style="word-break: break-word;">
          {{ name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiCalendar }}
          </v-icon>
          {{ datetime | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY - HH:mm') }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiMapMarker }}
          </v-icon>
          Lat: {{ coords[0].toFixed(5) }}, Lon: {{ coords[1].toFixed(5) }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiViewList }}
          </v-icon>
          {{ classification(category) }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider v-show="show" />

    <v-expand-transition>
      <div v-show="show">
        <v-list-item class="mt-0 mb-0 pt-0 pb-0 pr-0">
          <v-spacer />

          <v-btn
            v-if="isSeriesParent && seriesData"
            class="mr-2"
            color="info"
            :to="'/join/' + seriesData.tag"
          >
            <v-icon>
              {{ mdiHiking }}
            </v-icon>
          </v-btn>

          <v-btn
            v-if="isSeriesParent && seriesData"
            class="mr-2"
            color="info"
            @click="addSeriesChild"
          >
            <v-icon>
              {{ mdiMapMarkerPlus }}
            </v-icon>
          </v-btn>

          <v-btn
            v-if="isSeriesParent && seriesData"
            class="mr-2"
            color="info"
            @click="openSeriesOnMap"
          >
            <v-icon>
              {{ mdiMapSearch }}
            </v-icon>
          </v-btn>

          <v-btn
            class="mr-2"
            color="secondary"
            @click="openMapDialog"
          >
            <v-icon>
              {{ mdiMap }}
            </v-icon>
          </v-btn>
        </v-list-item>

        <div @click="toggle">
          <v-card-text v-if="isSeriesParent" class="pt-0 mt-2 mb-0 pb-0" style="word-break: break-word;">
            <v-chip
              v-if="seriesData"
              class="disable-events mb-0 pb-0"
              label
              small
              color="info"
            >
              {{ seriesData.name }}
            </v-chip>
          </v-card-text>
          <v-card-title class="mt-0 pt-0" style="word-break: break-word;">
            <span>{{ name }}</span>
          </v-card-title>
          <v-card-text class="pt-0 mb-0 pb-0" style="word-break: break-word;">
            {{ description }}
          </v-card-text>
        </div>

        <v-card-text class="mt-0 pt-0">
          <v-slide-group
            show-arrows
          >
            <v-slide-item
              v-for="(image, j) in images"
              :key="j"
              class="mt-1 mb-1 mr-1"
            >
              <v-avatar
                tile
                size="80"
                color="placeholder"
              >
                <v-img
                  :src="preview(image)"
                  style="width: 80px; float: left; max-width: 80px; text-align: end;"
                  aspect-ratio="1"
                  @click="showMediaDisplay(j)"
                />
              </v-avatar>
            </v-slide-item>
          </v-slide-group>
        </v-card-text>
      </div>
    </v-expand-transition>

    <v-divider />

    <v-list-item>
      <info-chip-votes
        :id="id"
        post-type="POST_TYPE_QUESTION"
        :up="votes.upCount"
        :down="votes.downCount"
      />
      <v-spacer />
      <info-chip-number
        v-if="isSeriesParent"
        class="mr-1"
        :icon="mdiMapMarkerMultiple"
        :value="seriesChildren.length"
        :primary="'#935F00'"
        :secondary="'info'"
        @click="openForumSeriesDialog(seriesData.id)"
      />
      <info-chip-number
        class="mr-1"
        :icon="mdiSchool"
        :value="expertAnswers"
        :primary="'primary'"
        :secondary="'secondary'"
        @click="openForumDialog"
      />
      <info-chip-number
        :icon="mdiAccountGroup"
        :value="communityAnswers"
        :primary="'primary'"
        :secondary="'secondary'"
        @click="openForumDialog"
      />
    </v-list-item>

    <v-dialog
      v-model="active"
    >
      <v-img
        :src="source"
        style="width: 100%; float: left; text-align: end;"
        aspect-ratio="1"
      >
        <v-btn
          icon
          dark
          large
          @click="active = false"
        >
          <v-icon>
            {{ mdiClose }}
          </v-icon>
        </v-btn>
      </v-img>
    </v-dialog>
  </v-card>
</template>

<script>
import { mdiCalendar, mdiMapMarker, mdiViewList, mdiOpenInNew, mdiChevronUp, mdiChevronDown, mdiAccountGroup, mdiSchool, mdiThumbsUpDown, mdiClose, mdiMap, mdiMapMarkerMultiple, mdiMapMarkerPlus, mdiMapSearch, mdiHiking } from '@mdi/js'
import { getCategoryFromCode } from '@/util/ogr-utils'
import ForumDialog from '~/components/forum/ForumDialog'
import InfoChipNumber from '~/components/info/InfoChipNumber'
import ForumContent from '~/components/forum/ForumContent'
import InfoChipVotes from '~/components/info/InfoChipVotes'
import InfoMap from '~/components/info/InfoMap'
import questionSeriesByTag from '~/apollo/queries/questionSeriesByTag.gql'
import questionSeriesChildrenMin from '~/apollo/queries/questionSeriesChildrenMin.gql'

export default {
  name: 'InfoCardQuestion',
  components: { InfoMap, InfoChipVotes, ForumContent, InfoChipNumber, ForumDialog },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    id: {
      required: true,
      default: null
    },
    name: {
      type: String,
      required: true,
      default: ''
    },
    description: {
      type: String,
      required: true,
      default: ''
    },
    datetime: {
      type: String,
      required: true,
      default: ''
    },
    category: {
      type: String,
      required: true,
      default: ''
    },
    coords: {
      type: Array,
      required: true,
      default: () => { return [] }
    },
    properties: {
      type: Object,
      required: true,
      default: () => { return {} }
    },
    votes: {
      type: Object,
      required: true,
      default: () => { return {} }
    },
    images: {
      type: Array,
      required: true,
      default: () => { return [] }
    },
    answers: {
      type: Array,
      required: true,
      default: () => { return [] }
    }
  },

  data () {
    return {
      mdiCalendar,
      mdiMapMarker,
      mdiViewList,
      mdiOpenInNew,
      mdiChevronUp,
      mdiChevronDown,
      mdiAccountGroup,
      mdiSchool,
      mdiThumbsUpDown,
      mdiClose,
      mdiMap,
      mdiMapMarkerMultiple,
      mdiMapMarkerPlus,
      mdiMapSearch,
      mdiHiking,
      show: false,
      active: false,
      source: undefined,
      forum: false,
      map: false,
      ogrMapUrl: this.$config.ogrMapUrl,
      ogrApiUrl: this.$config.ogrApiUrl,
      ogrStaUrl: this.$config.ogrStaUrl,
      expertAnswers: 0,
      communityAnswers: 0,
      semanticTags: [],
      functionalTags: [],
      isSeriesParent: false,
      seriesTag: '',
      seriesData: undefined,
      seriesChildren: []
    }
  },

  created () {
    this.$nuxt.$on('close-question-expanse', () => {
      this.show = false
    })
  },

  mounted () {
    this.countAnswers()
    this.checkSeries()
  },

  beforeDestroy () {
    this.$nuxt.$off('close-question-expanse')
  },

  methods: {
    addSeriesChild () {
      window.localStorage.setItem('series-instant-active', 'true')
      window.localStorage.setItem('series-event-active', 'false')
      window.localStorage.setItem('series-tag', this.seriesData.tag)
      window.localStorage.setItem('series-name', this.seriesData.name)
      this.$nuxt.$emit('set-app-color', 'info')
      this.$nuxt.$router.push('/question')
    },
    openSeriesOnMap () {
      this.$store.commit('ogr/resetFilters')
      if (this.seriesData.parentQuestion.id && this.seriesData.tag) {
        window.localStorage.setItem('series-display-id', this.seriesData.parentQuestion.id)
        window.localStorage.setItem('series-display-tag', this.seriesData.tag)
        this.$nuxt.$router.push('/explore')
      }
    },
    checkSeries () {
      if (this.properties['series-state'] === 'series-parent') {
        this.isSeriesParent = true
        this.$axios.get(this.ogrStaUrl + '/FROST-Server/v1.1/Datastreams(' + this.id + ')/Observations' + "?$filter=parameters/type eq 'semantic'&$select=result")
          .then((response) => {
            this.semanticTags = response.data.value
            this.seriesTag = this.checkSeriesTag()
            this.getSeriesData(this.seriesTag)
          })
          .catch(function () {})
      }
    },
    checkSeriesStatus () {
      this.open = Date.now() < Date.parse(this.seriesData.end)
    },
    checkSeriesTag () {
      for (let i = 0; i < this.semanticTags.length; i++) {
        if (this.semanticTags[i].result.substring(0, 2) === 's_') {
          return this.semanticTags[i].result
        }
      }
      return ''
    },
    openForumSeriesDialog (id) {
      this.$nuxt.$router.push('/series/' + id)
    },
    toggle () {
      if (this.show === true) {
        this.show = false
      } else {
        this.$nuxt.$emit('close-question-expanse')
        this.show = true
      }
    },
    openForumDialog () {
      this.forum = true
      this.$emit('forum-dialog-opened')
    },
    openMapDialog () {
      this.map = true
      this.$emit('forum-dialog-opened')
    },
    closeForumDialog () {
      this.forum = false
      this.$emit('forum-dialog-closed')
    },
    closeMapDialog () {
      this.map = false
      this.$emit('forum-dialog-closed')
    },
    classification (category) {
      return getCategoryFromCode(category, this.$i18n.locale)
    },
    showMediaDisplay (j) {
      this.source = this.medium(this.images[j])
      this.active = true
    },
    preview (url) {
      return url + '?size=preview'
    },
    medium (url) {
      return url + '?size=medium'
    },
    countAnswers () {
      let expertAnswers = 0
      let communityAnswers = 0

      for (const answer of this.answers) {
        let isExpert = false
        for (const role of answer.user.roles) {
          if (role.name === 'ROLE_EXPERT') {
            isExpert = true
          }
        }

        if (isExpert) {
          expertAnswers += 1
        } else {
          communityAnswers += 1
        }
      }

      this.expertAnswers = expertAnswers
      this.communityAnswers = communityAnswers
    },
    getSeriesData (tag) {
      this.$apollo.query({
        query: questionSeriesByTag,
        variables: {
          tag
        },
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        this.seriesData = response.data.questionSeriesByTag
        this.getSeriesChildren(this.seriesData.id)
        this.checkSeriesStatus()
      })
    },
    getSeriesChildren (id) {
      this.$apollo.query({
        query: questionSeriesChildrenMin,
        variables: {
          id
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        this.seriesChildren = response.data.questionSeriesChildren
      })
    }
  }
}
</script>

<style>

</style>
