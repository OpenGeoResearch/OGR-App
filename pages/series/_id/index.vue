<!--
    Copyright (C) 2023 Geodätisches Institut RWTH Aachen University,
    Mies-van-der-Rohe-Straße 1, D 52074 Aachen, Germany

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
    <forum-dialog :active="forum" @click-dialog-close="closeForumDialog">
      <forum-content
        v-if="seriesParent"
        :question="seriesParent.datastream.name"
        :description="seriesParent.datastream.description"
        :category="classification(seriesParent.datastream.category)"
        :images="seriesParent.datastream.images"
        :question-id="seriesParent.id"
        @forum-dialog-opened="forum = true"
        @forum-dialog-closed="forum = false"
        @forum-input-dialog-opened="input = true"
        @forum-input-dialog-closed="input = false"
      />
    </forum-dialog>

    <v-card
      v-if="seriesParent && seriesData"
      v-ripple="false"
      class="mb-2 mt-1 ml-0 mr-0"
      outlined
    >
      <v-card-text class="mb-0 pb-1">
        <v-img v-if="seriesParent.datastream.images.length > 0" :src="medium(seriesParent.datastream.images[0])" lazy-src="/ogr_placeholder_2.png" />
        <v-img v-else src="/ogr_placeholder_2.png" />
      </v-card-text>
      <v-card-title class="pt-0 mt-0 pb-0 mb-0" style="word-break: break-word;">
        <v-chip
          class="mt-1 pb-0 mb-0"
          label
          small
          color="info"
        >
          {{ seriesData.name }}
        </v-chip>
        <v-spacer />
      </v-card-title>
      <v-card-title class="pt-0 mt-0 pb-0" style="word-break: break-word;">
        {{ seriesParent.datastream.name }}
      </v-card-title>
      <v-card-subtitle v-if="open" class="pt-0 mt-0 mb-0 pb-0" style="word-break: break-word;">
        {{ $t('series_status_open_until') }} {{ seriesData.end | dateParse('YYYY-MM-DD HH:mm') | dateFormat('DD. MMMM YYYY - HH:mm') }}
      </v-card-subtitle>
      <v-card-subtitle v-else class="pt-0 mt-0 mb-0 pb-0" style="word-break: break-word;">
        {{ $t('series_status_closed') }}
      </v-card-subtitle>

      <v-expand-transition>
        <div v-show="show">
          <v-card-title class="pt-0 mt-0 pb-0 mb-0" style="word-break: break-word;">
            <v-chip
              class="mt-1 pb-0 mb-0"
              label
              small
              color="highlight"
            >
              {{ classification(seriesParent.datastream.category) }}
            </v-chip>
            <v-spacer />
          </v-card-title>
          <v-card-text class="pt-0 mb-0 pb-0" style="word-break: break-word;">
            {{ seriesParent.datastream.description }}
          </v-card-text>
          <v-card-text class="mt-0 pt-0">
            <v-slide-group
              show-arrows
            >
              <v-slide-item
                v-for="(image, j) in seriesParent.datastream.images"
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

      <v-divider />

      <v-list-item>
        <info-chip-votes
          :id="seriesParent.id"
          post-type="POST_TYPE_QUESTION"
          :up="seriesParent.votes.upCount"
          :down="seriesParent.votes.downCount"
        />
        <v-spacer />
        <info-chip-number
          class="mr-1"
          :icon="mdiMapMarkerMultiple"
          :value="seriesChildren.length"
          :primary="'#935F00'"
          :secondary="'info'"
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
    </v-card>

    <v-banner
      v-if="seriesChildren.length > 0"
      dark
      single-line
      class="mt-3 mb-2"
      elevation="3"
      :icon="mdiMapMarkerMultiple"
      color="info"
    >
      Elemente dieser Serie
    </v-banner>

    <template v-for="q in seriesChildren">
      <forum-series-child-preview
        v-if="q"
        :key="q.id"
        :question="q"
        @forum-dialog-opened="forum = true"
        @forum-dialog-closed="forum = false"
        @forum-input-dialog-opened="input = true"
        @forum-input-dialog-closed="input = false"
      />
    </template>
  </v-container>
</template>

<script>
import { mdiArrowLeft, mdiMapMarkerMultiple, mdiChevronDown, mdiChevronUp, mdiSchool, mdiAccountGroup } from '@mdi/js'
import questionSeriesById from '~/apollo/queries/questionSeriesById.gql'
import question from '~/apollo/queries/question.gql'
import questionSeriesChildren from '~/apollo/queries/questionSeriesChildren.gql'
import ForumSeriesChildPreview from '~/components/forum/ForumSeriesChildPreview'
import { getCategoryFromCode } from '~/util/ogr-utils'
import InfoChipNumber from '~/components/info/InfoChipNumber'
import InfoChipVotes from '~/components/info/InfoChipVotes'
import ForumDialog from '~/components/forum/ForumDialog'
import ForumContent from '~/components/forum/ForumContent'

export default {
  components: { ForumContent, ForumDialog, InfoChipVotes, InfoChipNumber, ForumSeriesChildPreview },
  data () {
    return {
      mdiArrowLeft,
      mdiMapMarkerMultiple,
      mdiChevronDown,
      mdiChevronUp,
      mdiSchool,
      mdiAccountGroup,
      seriesId: undefined,
      seriesData: undefined,
      open: true,
      seriesParent: undefined,
      seriesChildren: [],
      forum: false,
      input: false,
      show: false,
      expertAnswers: 0,
      communityAnswers: 0
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_series'))
    window.addEventListener('popstate', this.onArrowBackAction)
  },

  mounted () {
    this.seriesId = this.$route.params.id
    this.getSeriesData()
    this.getSeriesChildren()
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
    openForumDialog () {
      this.forum = true
      this.$emit('forum-dialog-opened')
    },
    closeForumDialog () {
      this.forum = false
      this.$emit('forum-dialog-closed')
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
    goToAllSeries () {
      this.$router.push('/series/')
    },
    checkSeriesStatus () {
      this.open = Date.now() < Date.parse(this.seriesData.end)
    },
    countAnswers () {
      let expertAnswers = 0
      let communityAnswers = 0

      for (const answer of this.seriesParent.answers) {
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
    getSeriesData () {
      this.$apollo.query({
        query: questionSeriesById,
        variables: {
          id: this.seriesId
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        this.seriesData = response.data.questionSeriesById
        this.checkSeriesStatus()
        this.getSeriesParent()
      })
    },
    getSeriesParent () {
      this.$apollo.query({
        query: question,
        variables: {
          id: this.seriesData.parentQuestion.id
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        this.seriesParent = response.data.question
        this.countAnswers()
      })
    },
    getSeriesChildren () {
      this.$apollo.query({
        query: questionSeriesChildren,
        variables: {
          id: this.seriesId
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
