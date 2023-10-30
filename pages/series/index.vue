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
  <v-container>
    <info-alert-active-series-event-full
      :active="active.active"
      :tag="active.tag"
      :series-data="active.data"
      @click-leave-series-event="leaveActiveSeriesEvent"
    />
    <new-feature-dialog
      :active="info"
      :title="$t('new_feature_series_title').toString()"
      :first-info="$t('new_feature_series_text_one').toString()"
      :second-info="$t('new_feature_series_text_two').toString()"
      :button="$t('new_feature_series_button').toString()"
      @click-check-button="deactivateInfo"
    />
    <v-list-item class="pa-0 ma-0">
      <v-switch
        v-model="open"
        class="pa-0 ma-0"
        color="info"
        :label="$t('series_open_only')"
        hide-details
      />
      <v-spacer />
      <v-btn-toggle
        v-model="sortStrategy"
        class="d-flex justify-end mt-0 mb-0 pb-0"
        color="primary"
        dense
        mandatory
      >
        <v-btn value="newest">
          {{ $t('sort_newest') }}
        </v-btn>

        <v-btn value="oldest">
          {{ $t('sort_oldest') }}
        </v-btn>

        <v-btn value="highestVoted">
          {{ $t('sort_best') }}
        </v-btn>
      </v-btn-toggle>
    </v-list-item>
    <template v-for="q in sortedSeries">
      <forum-series-parent-preview
        v-if="q"
        :key="q.id"
        :series="q"
        @forum-dialog-opened="forum = true"
        @forum-dialog-closed="forum = false"
        @forum-input-dialog-opened="input = true"
        @forum-input-dialog-closed="input = false"
      />
    </template>
  </v-container>
</template>

<script>
import questionSeries from '~/apollo/queries/questionSeries.gql'
import questionSeriesByTag from '~/apollo/queries/questionSeriesByTag.gql'
import ForumSeriesParentPreview from '~/components/forum/ForumSeriesParentPreview'
import NewFeatureDialog from '~/components/dialog/NewFeatureDialog'
import InfoAlertActiveSeriesEventFull from '~/components/info/InfoAlertActiveSeriesEventFull'

export default {
  components: { InfoAlertActiveSeriesEventFull, NewFeatureDialog, ForumSeriesParentPreview },
  data () {
    return {
      series: [],
      forum: false,
      input: false,
      info: true,
      active: {
        active: false,
        tag: '',
        data: {}
      },
      sortStrategy: 'newest',
      open: false
    }
  },

  computed: {
    oldestSeriesFirst () {
      if (this.open) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.openSeries.sort((a, b) => new Date(a.parentQuestion.datastream.resultTime) - new Date(b.parentQuestion.datastream.resultTime))
      }
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return this.series.sort((a, b) => new Date(a.parentQuestion.datastream.resultTime) - new Date(b.parentQuestion.datastream.resultTime))
    },
    newestSeriesFirst () {
      if (this.open) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.openSeries.sort((a, b) => new Date(a.parentQuestion.datastream.resultTime) - new Date(b.parentQuestion.datastream.resultTime)).reverse()
      }
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return this.series.sort((a, b) => new Date(a.parentQuestion.datastream.resultTime) - new Date(b.parentQuestion.datastream.resultTime)).reverse()
    },
    highestVotedSeriesFirst () {
      if (this.open) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.openSeries.sort((a, b) => (b.parentQuestion.votes.upCount - b.parentQuestion.votes.downCount) - (a.parentQuestion.votes.upCount - a.parentQuestion.votes.downCount))
      }
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return this.series.sort((a, b) => (b.parentQuestion.votes.upCount - b.parentQuestion.votes.downCount) - (a.parentQuestion.votes.upCount - a.parentQuestion.votes.downCount))
    },
    openSeries () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return this.series.filter(a => Date.now() < Date.parse(a.end))
    },
    sortedSeries () {
      if (this.sortStrategy === 'highestVoted') {
        return this.highestVotedSeriesFirst
      } else if (this.sortStrategy === 'newest') {
        return this.newestSeriesFirst
      } else {
        return this.oldestSeriesFirst
      }
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_series'))
    window.addEventListener('popstate', this.onArrowBackAction)
  },

  mounted () {
    if (window.localStorage.getItem('new-feature-series-opened') === 'true') {
      this.info = false
    }
    this.checkActiveSeriesEvent()
    this.getSeries()
  },

  beforeDestroy () {
    window.removeEventListener('popstate', this.onArrowBackAction)
  },

  methods: {
    onArrowBackAction () {
      if (this.forum) {
        if (this.input) {
          this.$nuxt.$emit('close-forum-input-dialog')
        } else {
          this.$nuxt.$emit('close-forum-dialog')
        }
      } else {
        this.$nuxt.$emit('arrow-back-navigation')
      }
    },
    checkActiveSeriesEvent () {
      if (window.localStorage.getItem('series-event-active') === 'true') {
        this.active.active = true
        this.active.tag = window.localStorage.getItem('series-tag')
        this.getSeriesByTag(this.active.tag)
      }
    },
    leaveActiveSeriesEvent () {
      window.localStorage.setItem('series-event-active', 'false')
      this.$nuxt.$emit('set-app-color', 'primary')
      this.active.active = false
    },
    deactivateInfo () {
      window.localStorage.setItem('new-feature-series-opened', 'true')
      this.info = false
    },
    getSeriesByTag (tag) {
      this.$apollo.query({
        query: questionSeriesByTag,
        variables: {
          tag
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        this.active.data = response.data.questionSeriesByTag
      })
    },
    getSeries () {
      this.$apollo.query({
        query: questionSeries,
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        this.series = response.data.questionSeries
      })
    }
  }
}
</script>
