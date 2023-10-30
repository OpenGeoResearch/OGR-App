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
        :question="series.parentQuestion.datastream.name"
        :description="series.parentQuestion.datastream.description"
        :category="classification(series.parentQuestion.datastream.category)"
        :images="series.parentQuestion.datastream.images"
        :question-id="series.parentQuestion.id"
        @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
        @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
      />
    </forum-dialog>

    <forum-dialog :active="map" @click-dialog-close="closeMapDialog">
      <info-map
        :coords="series.parentQuestion.datastream.observedArea.coordinates"
        :zoom="15"
        :series-children="seriesChildrenMin"
      />
    </forum-dialog>

    <v-list-item>
      <v-list-item-avatar
        tile
        size="80"
        color="placeholder"
      >
        <v-img v-if="series.parentQuestion.datastream.images.length > 0" :src="preview(series.parentQuestion.datastream.images[0])" @click="showMediaDisplay(0)" />
        <v-img v-else src="/ogr_placeholder_2.png" />
      </v-list-item-avatar>
      <v-list-item-content class="mx-0" @click="toggle">
        <v-list-item-title class="title" style="word-break: break-word;">
          {{ series.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiCalendar }}
          </v-icon>
          {{ series.parentQuestion.datastream.resultTime | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY - HH:mm') }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiMapMarker }}
          </v-icon>
          Lat: {{ series.parentQuestion.datastream.observedArea.coordinates[0].toFixed(5) }}, Lon: {{ series.parentQuestion.datastream.observedArea.coordinates[1].toFixed(5) }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiViewList }}
          </v-icon>
          {{ classification(series.parentQuestion.datastream.category) }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider v-show="show" />

    <v-expand-transition>
      <div v-show="show">
        <v-list-item class="mt-0 mb-0 pt-0 pb-0 pr-0">
          <v-spacer />

          <v-btn
            v-if="series.tag && seriesStatus"
            class="mr-2"
            color="info"
            :to="'/join/' + series.tag"
          >
            <v-icon>
              {{ mdiHiking }}
            </v-icon>
          </v-btn>

          <v-btn
            v-if="series.tag && seriesStatus"
            class="mr-2"
            color="info"
            @click="addSeriesChild"
          >
            <v-icon>
              {{ mdiMapMarkerPlus }}
            </v-icon>
          </v-btn>

          <v-btn
            v-if="series.tag"
            class="mr-2"
            color="info"
            @click="openSeriesOnMap"
          >
            <v-icon>
              {{ mdiMapSearch }}
            </v-icon>
          </v-btn>

          <v-btn
            v-if="series.parentQuestion.id"
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
          <v-card-text class="pt-0 mt-2 mb-0 pb-0" style="word-break: break-word;">
            <v-chip
              class="disable-events mr-2"
              label
              small
              color="info"
            >
              {{ series.name }}
            </v-chip>
          </v-card-text>
          <v-card-title class="pt-0 mb-0 pb-0" style="word-break: break-word;">
            <span>{{ series.parentQuestion.datastream.name }}</span>
          </v-card-title>
          <v-card-text class="pt-0 mb-1 pb-0" style="word-break: break-word;">
            {{ series.parentQuestion.datastream.description }}
          </v-card-text>
        </div>

        <v-list-item>
          <v-card
            class="ma-0 pa-0 mb-1"
            elevation="0"
          >
            <v-card-text v-if="series" class="pa-0 ma-0" style="word-break: break-word;">
              <span>{{ $t('series_name') }}</span>
              <span class="font-weight-bold">{{ series.name }}</span>
            </v-card-text>
            <v-card-text v-if="series && seriesStatus" class="pa-0 ma-0" style="word-break: break-word;">
              <span>{{ $t('series_status') }}</span>
              <span class="font-weight-bold">{{ $t('series_status_open') }} ({{ $t('series_status_until') }} {{ series.end | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY') }})</span>
            </v-card-text>
            <v-card-text v-else class="pa-0 ma-0" style="word-break: break-word;">
              <span>{{ $t('series_status') }}</span>
              <span class="font-weight-bold">{{ $t('series_status_closed') }}</span>
            </v-card-text>
            <v-card-text v-if="series" class="pa-0 ma-0" style="word-break: break-word;">
              <span>{{ $t('series_tag') }}</span>
              <span class="font-weight-bold">{{ series.tag }}</span>
            </v-card-text>
          </v-card>
        </v-list-item>

        <v-card-text class="mt-0 pt-0">
          <v-slide-group
            show-arrows
          >
            <v-slide-item
              v-for="(image, j) in series.parentQuestion.datastream.images"
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
        :id="series.parentQuestion.id"
        post-type="POST_TYPE_QUESTION"
        :up="series.parentQuestion.votes.upCount"
        :down="series.parentQuestion.votes.downCount"
      />
      <v-spacer />
      <info-chip-number
        v-if="series.exam"
        class="mr-1"
        :icon="mdiMapMarkerMultiple"
        :value="'-'"
        :primary="'neutral'"
        :secondary="'#b3b3b3'"
      />
      <info-chip-number
        v-else
        class="mr-1"
        :icon="mdiMapMarkerMultiple"
        :value="seriesChildrenMin.length"
        :primary="'#935F00'"
        :secondary="'info'"
        @click="goToSeries(series.id)"
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
import { mapState } from 'vuex'
import { getCategoryFromCode } from '@/util/ogr-utils'
import ForumDialog from '~/components/forum/ForumDialog'
import InfoChipNumber from '~/components/info/InfoChipNumber'
import ForumContent from '~/components/forum/ForumContent'
import InfoChipVotes from '~/components/info/InfoChipVotes'
import InfoMap from '~/components/info/InfoMap'
import questionSeriesChildrenMin from '~/apollo/queries/questionSeriesChildrenMin.gql'

export default {
  name: 'ForumSeriesParentPreview',
  components: { InfoMap, InfoChipVotes, ForumContent, InfoChipNumber, ForumDialog },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    series: {
      type: Object,
      required: true
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
      expertAnswers: 0,
      communityAnswers: 0,
      seriesChildrenMin: [],
      children: false,
      loading: true
    }
  },

  computed: {
    ...mapState('ogr', ['selectedSeries']),

    seriesStatus () {
      return Date.now() < Date.parse(this.series.end)
    }
  },

  created () {
    this.$nuxt.$on('close-question-expanse', () => {
      this.show = false
    })
  },

  mounted () {
    this.countAnswers()
    this.getSeriesChildrenMin()
  },

  beforeDestroy () {
    this.$nuxt.$off('close-question-expanse')
  },

  methods: {
    addSeriesChild () {
      // ToDo: Über den Store übergeben
      window.localStorage.setItem('series-instant-active', 'true')
      window.localStorage.setItem('series-event-active', 'false')
      window.localStorage.setItem('series-tag', this.series.tag)
      window.localStorage.setItem('series-name', this.series.name)
      this.$nuxt.$emit('set-app-color', 'info')
      this.$nuxt.$router.push('/question')
    },
    openSeriesOnMap () {
      // ToDo: Über den Store übergeben
      this.$store.commit('ogr/resetFilters')
      if (this.series.parentQuestion.id && this.series.tag) {
        window.localStorage.setItem('series-display-id', this.series.parentQuestion.id)
        window.localStorage.setItem('series-display-tag', this.series.tag)
        this.$nuxt.$router.push('/explore')
      }
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
    goToSeries (id) {
      this.$nuxt.$router.push('/series/' + id)
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
      this.source = this.medium(this.series.parentQuestion.datastream.images[j])
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

      for (const answer of this.series.parentQuestion.answers) {
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
    getSeriesChildrenMin () {
      this.$apollo.query({
        query: questionSeriesChildrenMin,
        variables: {
          id: this.series.id
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        this.seriesChildrenMin = response.data.questionSeriesChildren
      })
    }
  }
}
</script>

<style scoped>
.disable-events {
  pointer-events: none
}
.cut-text
{
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
