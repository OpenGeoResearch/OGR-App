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
  <v-container
    id="lazy-loading-questions"
    fluid
  >
    <v-row>
      <v-col>
        <v-banner
          dark
          class="mb-2"
          elevation="3"
          :icon="mdiCloudOutline"
          color="secondary"
        >
          {{ $t('account_banner_stored') }}
        </v-banner>

        <info-card
          v-show="!firstLoad"
          v-if="storedQuestions === undefined"
          class="mb-2"
          :title="$t('account_info_title_stored')"
          :subtitle="$t('account_info_subtitle_stored')"
        />

        <info-card-question-skeleton
          v-show="firstLoad"
        />
        <v-lazy
          v-for="question in storedQuestions"
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
          />
        </v-lazy>
        <v-banner
          dark
          class="mb-2"
          elevation="3"
          :icon="mdiCloudOffOutline"
          color="secondary"
        >
          {{ $t('account_banner_anon') }}
        </v-banner>

        <info-card-question-skeleton
          v-show="firstLoad"
        />

        <info-card
          v-show="!firstLoad"
          v-if="anonymousQuestions === undefined"
          :title="$t('account_info_title_anon')"
          :subtitle="$t('account_info_subtitle_anon')"
        />
        <v-lazy
          v-for="question in anonymousQuestions"
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
          />
        </v-lazy>
      </v-col>
    </v-row>

    <info-snackbar
      :show="snackbar"
      :message="message"
      @click-snackbar="snackbar = false"
    />
  </v-container>
</template>

<script>
import { mdiCloudOutline, mdiCloudOffOutline } from '@mdi/js'
import questions from '@/apollo/queries/questions'
import InfoCard from '~/components/info/InfoCard.vue'
import InfoSnackbar from '~/components/info/InfoSnackbar.vue'
import InfoCardQuestion from '~/components/info/InfoCardQuestion.vue'
import InfoCardQuestionSkeleton from '~/components/info/InfoCardQuestionSkeleton'

export default {
  name: 'AccountData',
  components: { InfoCard, InfoCardQuestion, InfoSnackbar, InfoCardQuestionSkeleton },
  layout: 'default',

  data () {
    return {
      mdiCloudOutline,
      mdiCloudOffOutline,
      show: null,
      snackbar: false,
      message: '',
      account: '',
      notification: false,
      anonymousQuestions: undefined,
      storedQuestions: undefined,
      user: undefined,
      loading: true,
      firstLoad: true,
      isActive: false,
      forum: false
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_account'))
    this.account = window.localStorage.getItem('account-connected')
    this.getUserData()
    // eslint-disable-next-line nuxt/no-globals-in-created
    window.addEventListener('popstate', this.onArrowBackAction)
  },

  mounted () {
    const elementToObserve = document.querySelector('#lazy-loading-questions')
    const observer = new MutationObserver(function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.target.className === 'v-lazy') {
          this.firstLoad = false
          observer.disconnect()
        }
      }
    }.bind(this))
    observer.observe(elementToObserve, { characterData: true, attributes: false, childList: true, subtree: true })
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
    showSnackbar (message) {
      this.message = message
      this.snackbar = true
    },
    toggle (i) {
      if (i !== this.show) {
        this.show = i
      } else if (i === this.show) {
        this.show = null
      }
    },
    getQuestionsGql (ids, mode) {
      this.$apollo.query({
        query: questions,
        variables: {
          ids
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        if (response.data.questions) {
          if (mode === 'STORED') {
            this.storedQuestions = response.data.questions
          } else if (mode === 'ANON') {
            this.anonymousQuestions = response.data.questions
          }
        }
      })
    },
    async getUserData () {
      try {
        let anonymousQuestionIds = window.localStorage.getItem('anonymous-questions')
        if (anonymousQuestionIds !== null && anonymousQuestionIds !== '') {
          anonymousQuestionIds = anonymousQuestionIds.slice(0, -1).split(',')
        } else {
          anonymousQuestionIds = false
        }
        let storedQuestionIds = false
        if (this.$auth.loggedIn) {
          storedQuestionIds = await this.getQuestionIds()
        }

        if (anonymousQuestionIds) {
          this.getQuestionsGql(anonymousQuestionIds, 'ANON')
        }

        if (storedQuestionIds) {
          this.getQuestionsGql(storedQuestionIds, 'STORED')
        }

        if (!(anonymousQuestionIds && storedQuestionIds)) {
          this.firstLoad = false
        }
      } catch (err) {
        if (err.message === 'Request Error') {
          this.showSnackbar(this.$t('alert_request_error'))
        } else if (err.message === 'Network Error') {
          this.showSnackbar(this.$t('alert_network_error'))
        } else if (err.message === 'Unknown Error') {
          this.showSnackbar(this.$t('alert_unknown_error'))
        } else {
          this.showSnackbar(this.$t('alert_unexpected_error'))
        }
      }
    },
    getQuestionIds () {
      const config = { headers: { Authorization: this.$auth.getToken('local') } }
      return new Promise(function (resolve, reject) {
        window.$nuxt.$axios.get('/ogr/user/questions?username=' + window.$nuxt.$auth.user.username, config)
          .then((response) => {
            if (response.status === 200) {
              if (response.data.questionIds.length > 0) {
                return resolve(response.data.questionIds)
              }
              return resolve(false)
            }
            return reject(Error('Request Error'))
          })
          .catch((err) => {
            if (err.message === 'Network Error') {
              return reject(Error('Network Error'))
            } else {
              return reject(Error('Unknown Error'))
            }
          })
      })
    }
  }
}
</script>
