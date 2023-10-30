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
    fluid
  >
    <info-alert-active-series-event-full
      :active="series.active"
      :tag="series.tag"
      :series-data="series.data"
      @click-leave-series-event="leaveActiveSeriesEvent"
    />
    <v-row>
      <v-col>
        <home-info-project />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <home-stats :count-questions-all="data.countQuestionsAll" :count-questions-new="data.countQuestionsNew" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <home-news
          :news="data.news"
          :newest="newest"
          @click-news-left="clickNewsLeft"
          @click-news-right="clickNewsRight"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-tooltip
          :value="true"
          transition="v-slide-x-reverse-transition"
          left
          color="accentLight"
          z-index="0"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              class="mb-9 mr-1 fixedBtnPrimary"
              absolute
              bottom
              right
              fab
              large
              color="accent"
              to="/question"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>{{ mdiPlus }}</v-icon>
            </v-btn>
          </template>
          <span>{{ series.active ? $t('home_tooltip_observation') : $t('home_tooltip_question') }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiPlus, mdiCloudUploadOutline } from '@mdi/js'
import HomeStats from '~/components/home/HomeStats'
import HomeNews from '~/components/home/HomeNews'
import questionSeriesByTag from '~/apollo/queries/questionSeriesByTag.gql'
import InfoAlertActiveSeriesEventFull from '~/components/info/InfoAlertActiveSeriesEventFull'
import HomeInfoProject from '~/components/home/HomeInfoProject'

export default {
  name: 'Home',
  components: { HomeInfoProject, InfoAlertActiveSeriesEventFull, HomeNews, HomeStats },
  layout: 'default',

  data () {
    return {
      mdiPlus,
      mdiCloudUploadOutline,
      dialog: false,
      queued: [],
      data: {
        countQuestionsAll: '-',
        countQuestionsNew: '-',
        countUserQuestions: '-',
        news: {}
      },
      newest: 1,
      series: {
        active: false,
        tag: '',
        data: {}
      }
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_home'))
    const homedata = window.localStorage.getItem('homedata')
    if (homedata) {
      this.data = JSON.parse(homedata)
      this.newest = this.data.news.id
    }
    this.updateHomeData()
  },

  mounted () {
    this.checkActiveSeriesEvent()
  },

  methods: {
    leaveActiveSeriesEvent () {
      window.localStorage.setItem('series-event-active', 'false')
      this.$nuxt.$emit('set-app-color', 'primary')
      this.series.active = false
    },
    checkActiveSeriesEvent () {
      if (window.localStorage.getItem('series-event-active') === 'true') {
        this.series.active = true
        this.series.tag = window.localStorage.getItem('series-tag')
        this.getSeriesByTag(this.series.tag)
      }
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
        this.series.data = response.data.questionSeriesByTag
      })
    },
    sendErrorReport (code, err) {
      if (this.$nuxt.isOnline) {
        const request = {
          error: code,
          text: JSON.stringify(err)
        }
        const config = this.createConfig('application/json')
        window.$nuxt.$axios.post('/ogr/error/', request, config)
      }
    },
    createConfig (type) {
      if (this.$auth.getToken('local')) {
        return { headers: { 'Content-Type': type, Authorization: this.$auth.getToken('local') } }
      } else {
        return { headers: { 'Content-Type': type } }
      }
    },
    async updateHomeData () {
      try {
        if (this.$nuxt.isOnline) {
          const getHomeDataResponse = await this.getHomeData()
          if (getHomeDataResponse) {
            this.data = getHomeDataResponse
            window.localStorage.setItem('homedata', JSON.stringify(getHomeDataResponse))
          }
        } else {
          throw new Error('Network Error')
        }
      } catch (err) {
        if (err.message === 'Request Error') {
          this.sendErrorReport(1, err)
        } else if (err.message === 'Network Error') {
          this.sendErrorReport(2, err)
        } else if (err.message === 'Unknown Error') {
          this.sendErrorReport(3, err)
        } else {
          this.sendErrorReport(4, err)
        }
      }
    },
    getHomeData () {
      const config = { headers: { Authorization: this.$auth.getToken('local') } }

      return new Promise(function (resolve, reject) {
        window.$nuxt.$axios.get('/ogr/home/data', config)
          .then((response) => {
            if (response.status === 200) {
              return resolve(response.data)
            }
            return reject(Error('Request failed with status code: ' + response.status))
          })
          .catch((err) => {
            return reject(err)
          })
      })
    },
    async clickNewsLeft (id) {
      if (id > 1) {
        id = id - 1
      }
      try {
        if (this.$nuxt.isOnline) {
          const getNewsReponse = await this.getNews(id)
          if (getNewsReponse) {
            this.data.news = getNewsReponse
          }
        } else {
          throw new Error('Network Error')
        }
      } catch (err) {
        if (err.message === 'Request Error') {
          this.sendErrorReport(1, err)
        } else if (err.message === 'Network Error') {
          this.sendErrorReport(2, err)
        } else if (err.message === 'Unknown Error') {
          this.sendErrorReport(3, err)
        } else {
          this.sendErrorReport(4, err)
        }
      }
    },
    async clickNewsRight (id) {
      let homedata = window.localStorage.getItem('homedata')
      if (homedata) {
        homedata = JSON.parse(homedata)
      } else {
        return
      }

      if (id < homedata.news.id) {
        id = id + 1
      } else {
        return
      }
      try {
        if (this.$nuxt.isOnline) {
          const getNewsReponse = await this.getNews(id)
          if (getNewsReponse) {
            this.data.news = getNewsReponse
          }
        } else {
          throw new Error('Network Error')
        }
      } catch (err) {
        if (err.message === 'Request Error') {
          this.sendErrorReport(1, err)
        } else if (err.message === 'Network Error') {
          this.sendErrorReport(2, err)
        } else if (err.message === 'Unknown Error') {
          this.sendErrorReport(3, err)
        } else {
          this.sendErrorReport(4, err)
        }
      }
    },
    getNews (id) {
      const config = { headers: { Authorization: this.$auth.getToken('local') } }

      return new Promise(function (resolve, reject) {
        window.$nuxt.$axios.get('/ogr/home/news/' + id, config)
          .then((response) => {
            if (response.status === 200) {
              return resolve(response.data)
            }
            return reject(Error('Request failed with status code: ' + response.status))
          })
          .catch((err) => {
            return reject(err)
          })
      })
    }
  }
}
</script>

<style>
.fixedBtnPrimary {
  position: fixed;
  right: 10px;
  top: calc(100vh - 135px);
}
</style>
