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
    <v-select
      v-model="tab"
      :items="items"
      item-value="enum"
      item-text="label"
      outlined
      dense
      single-line
    />
    <div v-if="loading" class="text-center">
      <v-progress-circular
        :size="50"
        color="primary"
        indeterminate
      />
    </div>
    <div v-if="login" class="text-center">
      <info-card
        :subtitle="$t('find_info_login_subtitle')"
        :text="$t('find_info_login_text')"
      />
    </div>
    <div v-if="error" class="text-center">
      <info-card
        :subtitle="$t('find_info_no_result_subtitle')"
        :text="$t('find_info_no_result_text')"
      />
    </div>
    <div v-if="loading === false && login === false && error === false">
      <v-lazy
        v-for="question in questions"
        :key="question['@iot.id']"
        v-model="question.isActive"
        :options="{
          threshold: .5
        }"
        transition="fade-transition"
      >
        <info-card-question
          :id="question.id"
          :name="question.datastream.name"
          :description="question.datastream.description"
          :datetime="question.datastream.resultTime"
          :category="question.datastream.category"
          :coords="question.datastream.observedArea.coordinates"
          :properties="question.datastream.properties"
          :votes="question.votes"
          :images="question.datastream.images"
          :answers="question.answers"
          @forum-dialog-opened="forum = true"
          @forum-dialog-closed="forum = false"
          @forum-input-dialog-opened="input = true"
          @forum-input-dialog-closed="input = false"
        />
      </v-lazy>
    </div>
  </v-container>
</template>

<script>

import InfoCardQuestion from '~/components/info/InfoCardQuestion'
import newestQuestions from '~/apollo/queries/newestQuestions.gql'
import topVotedQuestions from '~/apollo/queries/topVotedQuestions.gql'
import unansweredQuestions from '~/apollo/queries/unansweredQuestions.gql'
import bookmarkedQuestions from '~/apollo/queries/bookmarkedQuestions.gql'
import InfoCard from '~/components/info/InfoCard'

export default {
  components: { InfoCard, InfoCardQuestion },
  data () {
    return {
      tab: 'TAB_NEW',
      items: [
        { id: 1, label: this.$t('find_questions_new'), enum: 'TAB_NEW' },
        { id: 2, label: this.$t('find_questions_top'), enum: 'TAB_TOP' },
        { id: 3, label: this.$t('find_questions_unanswered'), enum: 'TAB_UNANSWERED' },
        { id: 4, label: this.$t('find_questions_bookmarked'), enum: 'TAB_BOOKMARKED' }
      ],
      forum: false,
      input: false,
      loading: true,
      login: false,
      error: false,
      questions: []
    }
  },
  watch: {
    tab () {
      this.loading = true
      this.login = false
      this.error = false
      if (this.tab === 'TAB_NEW') {
        this.getNewestQuestions()
      } else if (this.tab === 'TAB_TOP') {
        this.getTopVotedQuestions()
      } else if (this.tab === 'TAB_UNANSWERED') {
        this.getUnansweredQuestions()
      } else if (this.tab === 'TAB_BOOKMARKED') {
        this.getBookmarkedQuestions()
      }
    },
    questions () {
      if (this.questions.length === 0) {
        this.error = true
      }
    }
  },
  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_find'))
    window.addEventListener('popstate', this.onArrowBackAction)
  },
  mounted () {
    this.getNewestQuestions()
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
    getNewestQuestions () {
      this.$apollo.query({
        query: newestQuestions,
        variables: {
          size: 15
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        if (response.data.newestQuestions) {
          this.questions = response.data.newestQuestions
        }
      }).catch(() => {
        this.error = true
      }).finally(() => {
        this.loading = false
      })
    },
    getTopVotedQuestions () {
      this.$apollo.query({
        query: topVotedQuestions,
        variables: {
          size: 15
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        if (response.data.topVotedQuestions) {
          this.questions = response.data.topVotedQuestions
          this.loading = false
        }
      }).catch(() => {
        this.error = true
      }).finally(() => {
        this.loading = false
      })
    },
    getUnansweredQuestions () {
      this.$apollo.query({
        query: unansweredQuestions,
        variables: {
          size: 15
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        if (response.data.unansweredQuestions) {
          this.questions = response.data.unansweredQuestions
          this.loading = false
        }
      }).catch(() => {
        this.error = true
      }).finally(() => {
        this.loading = false
      })
    },
    getBookmarkedQuestions () {
      if (this.$auth.loggedIn) {
        this.$apollo.query({
          query: bookmarkedQuestions,
          fetchPolicy: 'no-cache',
          context: {
            headers: {
              Authorization: this.$auth.getToken('local')
            }
          }
        }).then((response) => {
          if (response.data.bookmarkedQuestions) {
            this.questions = response.data.bookmarkedQuestions
            this.loading = false
          }
        }).catch(() => {
          this.error = true
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.login = true
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>

::v-deep .v-select__selections {
  text-transform: none;
}
</style>
