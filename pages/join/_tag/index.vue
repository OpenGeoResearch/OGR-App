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
    <v-card
      class="ma-0 pa-0"
      elevation="0"
    >
      <v-card-text>{{ $t('join_info_text') }}</v-card-text>
      <v-card-text v-if="loader" align="center">
        <v-progress-circular
          :size="115"
          :color="loading ? 'secondary' : 'neutral'"
          :indeterminate="loading"
        >
          <v-icon
            v-if="success === true"
            :size="70"
            color="primary"
          >
            {{ mdiCheck }}
          </v-icon>
          <v-icon
            v-if="error === true"
            :size="45"
            color="info"
          >
            {{ mdiAlert }}
          </v-icon>
        </v-progress-circular>
        <br>
        <span class="mt-2 pt-0 font-weight-bold">
          {{ message }}
        </span>
      </v-card-text>
      <div v-else>
        <v-card
          v-ripple="false"
          class="mb-2 mt-1 ml-1 mr-1"
          outlined
        >
          <v-card-title class="pt-0 mt-0 pb-0 mb-0" style="word-break: break-word;">
            <v-chip
              class="mt-1 pb-0 mb-0"
              label
              small
              color="info"
            >
              {{ series.name }}
            </v-chip>
            <v-spacer />
          </v-card-title>
          <v-card-title class="pt-0 mt-0 pb-0" style="word-break: break-word;">
            {{ series.parentQuestion.datastream.name }}
          </v-card-title>
          <v-card-subtitle v-if="open" class="pt-0 mt-0 mb-0 pb-0" style="word-break: break-word;">
            {{ $t('join_info_open') }} {{ series.end | dateParse('YYYY-MM-DD HH:mm') | dateFormat('DD. MMMM YYYY - HH:mm') }}
          </v-card-subtitle>
          <v-card-subtitle v-else class="pt-0 mt-0 mb-0 pb-0" style="word-break: break-word;">
            {{ $t('join_info_closed') }}
          </v-card-subtitle>

          <v-expand-transition>
            <div v-show="show">
              <v-card-text class="mb-0 pb-1">
                <v-img v-if="series.parentQuestion.datastream.images.length > 0" :src="medium(series.parentQuestion.datastream.images[0])" lazy-src="/ogr_placeholder_2.png" />
                <v-img v-else src="/ogr_placeholder_2.png" />
              </v-card-text>
              <v-card-title class="pt-0 mt-0 pb-0 mb-0" style="word-break: break-word;">
                <v-chip
                  class="mt-1 pb-0 mb-0"
                  label
                  small
                  color="highlight"
                >
                  {{ classification(series.parentQuestion.datastream.category) }}
                </v-chip>
                <v-spacer />
              </v-card-title>
              <v-card-text class="pt-0 mb-0 pb-0" style="word-break: break-word;">
                {{ series.parentQuestion.datastream.description }}
              </v-card-text>
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

          <v-card-actions class="mt-0 pt-0">
            <v-spacer />
            <v-btn
              v-ripple="false"
              small
              text
              color="info"
              @click="show = !show"
            >
              {{ show ? $t('show_less') : $t('show_more') }}
              <v-icon>{{ show ? mdiChevronUp : mdiChevronDown }}</v-icon>
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>

        <v-card-actions v-if="open">
          <v-spacer />
          <v-btn
            v-if="!joined"
            color="info"
            @click="attendSeries"
          >
            {{ $t('join_action_join_now') }}
          </v-btn>
          <v-btn
            v-else
            color="info"
            to="/question"
          >
            {{ $t('join_action_start_searching') }}
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </div>
    </v-card>
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
  </v-container>
</template>

<script>

import { mdiCheck, mdiAlert, mdiChevronUp, mdiChevronDown, mdiClose } from '@mdi/js'
import questionSeriesByTag from '~/apollo/queries/questionSeriesByTag.gql'
import { getCategoryFromCode } from '~/util/ogr-utils'

export default {

  data () {
    return {
      mdiCheck,
      mdiAlert,
      mdiChevronUp,
      mdiChevronDown,
      mdiClose,
      tag: undefined,
      series: undefined,
      message: 'Wir suchen gerade nach einer passenden Serie...',
      loader: true,
      loading: true,
      success: false,
      error: false,
      show: false,
      active: false,
      source: undefined,
      joined: false,
      open: true
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_join'))
  },

  mounted () {
    this.message = this.$t('join_message_searching')
    this.tag = this.$route.params.tag
    this.getSeriesData()
  },

  methods: {
    checkSeriesStatus () {
      this.open = Date.now() < Date.parse(this.series.end)
    },
    preview (url) {
      return url + '?size=preview'
    },
    medium (url) {
      return url + '?size=medium'
    },
    showMediaDisplay (j) {
      this.source = this.medium(this.series.parentQuestion.datastream.images[j])
      this.active = true
    },
    classification (category) {
      return getCategoryFromCode(category, this.$i18n.locale)
    },
    getSeriesData () {
      this.$apollo.query({
        query: questionSeriesByTag,
        variables: {
          tag: this.tag
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        if (response.data.questionSeriesByTag) {
          this.series = response.data.questionSeriesByTag
          this.message = this.$t('join_message_found')
          this.checkSeriesStatus()
          setTimeout(() => (this.success = true), 300)
          setTimeout(() => (this.loading = false), 300)
          setTimeout(() => (this.loader = false), 1500)
        } else {
          this.message = this.$t('join_message_not_found')
          setTimeout(() => (this.error = true), 300)
          setTimeout(() => (this.loading = false), 1500)
        }
      })
    },
    attendSeries () {
      window.localStorage.setItem('series-event-active', 'true')
      window.localStorage.setItem('series-instant-active', 'false')
      window.localStorage.setItem('series-tag', this.tag)
      window.localStorage.setItem('series-name', this.series.name)
      this.$nuxt.$emit('set-app-color', 'info')
      this.message = this.$t('join_message_not_joined')
      this.joined = true
    }
  }
}
</script>

<style scoped>

</style>
