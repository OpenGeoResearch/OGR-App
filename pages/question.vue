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
    <permission-dialog
      v-if="dialog.permission.geolocation && (!firstQuestion || policiesAccepted)"
      :title="$t('permission_geolocation_title')"
      :text="$t('permission_geolocation_text')"
      :demand="$t('permission_geolocation_demand')"
      :allow="$t('permission_geolocation_allow')"
      @change-permission-allow="setPermissionGeolocation(true)"
      @change-permission-deny="setPermissionGeolocation(false)"
    />

    <age-confirm-dialog
      v-if="firstQuestion && !ageConfirmed && !policiesAccepted"
      @click-age-true="setAge(true)"
      @click-age-false="setAge(false)"
    />

    <info-question-under-sixteen
      v-if="firstQuestion && !policiesAccepted && ageConfirmed && ageUnderSixteen && !infoConfirmed"
      @click-to-question="infoConfirmed = true"
    />

    <policy-dialog
      v-if="firstQuestion && !policiesAccepted && ageConfirmed && ((ageUnderSixteen && infoConfirmed) || !ageUnderSixteen)"
      @click-accept="policiesAccepted = true"
    />

    <info-alert-active-series-event
      :active="(!firstQuestion || policiesAccepted) && series.event"
      :tag="series.tag"
      :name="series.name"
      @click-leave-series-event="leaveActiveSeriesEvent"
    />

    <info-alert-active-series-instant
      :active="(!firstQuestion || policiesAccepted) && series.instant"
      :tag="series.tag"
      :name="series.name"
      @click-leave-series-event="cancelActiveSeriesInstant"
    />

    <v-form
      v-if="!firstQuestion || policiesAccepted"
      id="form"
    >
      <!-- Input: Location -->
      <map-dialog
        :active="dialog.location"
        :map.sync="map"
        :last-coords.sync="lastCoords"
        :marker-coords.sync="markerCoords"
        :manual="manualGeoLocation"
        @click-center-map="centerMap"
        @click-dialog-close="dialog.location = false"
        @click-dialog-submit="dialog.location = false, manCoords=map.center, markerCoords=map.center"
      />

      <map-mini
        :map.sync="map"
        :marker-coords.sync="markerCoords"
        :last-coords.sync="lastCoords"
      />

      <map-list
        :lat="markerCoords[1].toFixed(7)"
        :lon="markerCoords[0].toFixed(7)"
        :accuracy="lastAccuracy.toFixed(1)"
        :manual="manualGeoLocation"
        @click-dialog-open="dialog.location = !dialog.location"
        @click-center-map="centerMap"
      />

      <v-divider />

      <!-- Input: Frage -->
      <input-dialog
        :active="dialog.question"
        :invalid="input.question.length > 200"
        @click-dialog-close="dialog.question = false"
        @update-dialog-value="cacheInput"
      >
        <v-textarea
          v-model="input.question"
          :rules="[rules.length(200)]"
          counter="200"
          outlined
          autofocus
          no-resize
          :label="$t('input_question_text')"
          placeholder=""
          rows="4"
        />
      </input-dialog>

      <input-list
        :title="(series.event || series.instant) ? $t('input_observation_title').toString() : $t('input_question_title')"
        :subtitle="input.question !== '' ? input.question : (series.event || series.instant) ? $t('input_observation_text').toString() : $t('input_question_text')"
        :icon="mdiHeadQuestion"
        color="secondary"
        @click-list-open="dialog.question = !dialog.question"
      />

      <v-divider />

      <!-- Input: Beschreibung -->
      <input-dialog
        :active="dialog.description"
        :invalid="input.description.length > 4000"
        @click-dialog-close="dialog.description = false"
        @update-dialog-value="cacheInput"
      >
        <v-textarea
          v-model="input.description"
          :rules="[rules.length(4000)]"
          counter="4000"
          outlined
          autofocus
          no-resize
          :label="$t('input_description_text')"
          placeholder=""
          rows="6"
        />
      </input-dialog>

      <input-list
        :title="$t('input_description_title')"
        :subtitle="input.description !== '' ? input.description : $t('input_description_text')"
        :icon="mdiTextBox"
        color="secondary"
        @click-list-open="dialog.description = !dialog.description"
      />

      <v-divider />

      <!-- Input: Kategorisierung -->
      <input-dialog
        :active="dialog.category"
        @click-dialog-close="dialog.category = false"
      >
        <input-classification
          v-model="input.category"
          @update-input-cache="cacheInput"
        />
      </input-dialog>

      <input-list
        :title="$t('input_category_title')"
        :subtitle="input.category !== undefined ? input.category.name : $t('input_category_text')"
        :icon="mdiViewList"
        color="secondary"
        @click-list-open="dialog.category = !dialog.category"
      />

      <v-divider />

      <!-- Input: Tags -->
      <input-dialog
        :active="dialog.tags"
        @click-dialog-close="dialog.tags = false"
      >
        <input-tags
          v-model="input.tags"
          @update-input-cache="cacheInput"
        />
      </input-dialog>

      <input-list
        :title="$t('input_tags_title')"
        :subtitle="input.tags.length > 0 ? $t('input_tags_text_set', [input.tags.length]) : $t('input_tags_text_unset')"
        :icon="mdiPoundBox"
        color="secondary"
        @click-list-open="dialog.tags = !dialog.tags"
      />

      <v-divider />

      <!-- Input: Fotos -->
      <input-image
        @input-media-image="updateImages"
        @input-media-too-large="showSnackbar($t('input_media_too_large'))"
      />

      <v-divider />

      <input-anonymous-checkbox
        v-if="this.$auth.loggedIn"
        v-model="anonymous"
        :title="$t('input_anon_title')"
        :subtitle="anonymous === true ? $t('input_anon_set') : $t('input_anon_unset')"
        :hint="anonymous === true ? $t('input_anon_set_hint') : $t('input_anon_unset_hint')"
        :icon="anonymous === true ? mdiIncognito : mdiIncognitoOff"
        color="info"
        @update-input-cache="cacheInput"
      />

      <v-divider />
    </v-form>

    <info-snackbar
      :show="snackbar"
      :message="message"
      @close-manual="snackbar = false"
      @close-auto="snackbar = false"
    />

    <nuxt />
  </v-container>
</template>

<script>
import { mdiHeadQuestion, mdiTextBox, mdiViewList, mdiPoundBox, mdiIncognito, mdiIncognitoOff } from '@mdi/js'
import { v4 as uuidv4 } from 'uuid'
import { generateTimestamp } from '@/util/url-utils.js'
import MapDialog from '~/components/map/MapDialog.vue'
import MapMini from '~/components/map/MapMini.vue'
import MapList from '~/components/map/MapList.vue'
import InputDialog from '~/components/input/InputDialog.vue'
import InputList from '~/components/input/InputList.vue'
import InputImage from '~/components/input/InputImage.vue'
import InputClassification from '~/components/input/InputClassification.vue'
import InputTags from '~/components/input/InputTags.vue'
import InfoSnackbar from '~/components/info/InfoSnackbar.vue'
import PermissionDialog from '~/components/dialog/PermissionDialog'
import InputAnonymousCheckbox from '~/components/input/InputAnonymousCheckbox'
import AgeConfirmDialog from '~/components/dialog/AgeConfirmDialog'
import InfoQuestionUnderSixteen from '~/components/info/InfoQuestionUnderSixteen'
import PolicyDialog from '~/components/dialog/PolicyDialog'
import InfoAlertActiveSeriesEvent from '~/components/info/InfoAlertActiveSeriesEvent'
import InfoAlertActiveSeriesInstant from '~/components/info/InfoAlertActiveSeriesInstant'
import questionSeriesByTag from '~/apollo/queries/questionSeriesByTag.gql'

export default {
  name: 'QuestionInputForm',
  components: { InfoAlertActiveSeriesInstant, InfoAlertActiveSeriesEvent, PolicyDialog, InfoQuestionUnderSixteen, AgeConfirmDialog, MapDialog, MapMini, MapList, InputDialog, InputList, InputImage, InputClassification, InputTags, InfoSnackbar, PermissionDialog, InputAnonymousCheckbox },
  layout: 'default',

  data () {
    return {
      mdiHeadQuestion,
      mdiTextBox,
      mdiViewList,
      mdiPoundBox,
      mdiIncognito,
      mdiIncognitoOff,
      map: {
        center: [9.8123488, 51.3684384],
        zoom: 3,
        rotation: 0
      },
      markerCoords: [9.8123488, 51.3684384],
      manCoords: [0, 0],
      lastCoords: [0, 0],
      lastAccuracy: 0,
      geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      },
      navigatorId: undefined,
      anonymous: false,
      input: {
        question: '',
        description: '',
        tags: [],
        category: undefined,
        media: {
          images: [],
          audios: [],
          videos: []
        },
        thingUUID: '',
        datastreamUUID: ''
      },
      files: {
        images: [],
        audios: [],
        videos: []
      },
      absolute: true,
      dialog: {
        location: false,
        question: false,
        description: false,
        tags: false,
        category: false,
        permission: {
          geolocation: false,
          camera: false,
          microphone: false
        }
      },
      snackbar: false,
      message: '',
      rules: {
        length: len => v => (v || '').length <= len || this.$t('input_text_length', [len])
      },
      permission: {
        geolocation: false,
        camera: false,
        microphone: false
      },
      firstQuestion: true,
      ageConfirmed: false,
      ageUnderSixteen: true,
      policiesAccepted: false,
      infoConfirmed: false,
      manualGeoLocation: false,
      series: {
        event: false,
        instant: false,
        tag: '',
        name: '',
        expand: false,
        data: undefined,
        open: true
      }
    }
  },

  beforeCreate () {
    this.$nuxt.$emit('update-layout-form', true)
    this.$nuxt.$emit('update-layout-series')
  },

  created () {
    this.$nuxt.$on('check-form', () => {
      if (!this.firstQuestion || this.policiesAccepted) {
        this.startUpload()
      }
    })
    this.restoreQuestion()
  },

  beforeMount () {
    window.addEventListener('popstate', this.onArrowBackAction)
  },

  mounted () {
    this.checkActiveSeriesEvent()
    this.checkConsent()
    this.checkLogin()
    this.checkPermission()
    this.setPosition()
    this.trackPosition()
  },

  beforeDestroy () {
    this.$nuxt.$emit('update-layout-form', false)
    this.unregisterPositionWatcher()
    this.$nuxt.$off('check-form')
    this.$nuxt.$off('input-media-image')
    this.$nuxt.$off('input-media-audio')
    this.$nuxt.$off('input-media-video')
    // arrow back handling
    window.removeEventListener('popstate', this.onArrowBackAction)
  },

  methods: {
    onArrowBackAction () {
      if (this.dialog.question) {
        if (this.input.question.length <= 200) {
          this.dialog.question = false
        }
      } else if (this.dialog.description) {
        if (this.input.description.length <= 4000) {
          this.dialog.description = false
        }
      } else if (this.dialog.category) {
        this.dialog.category = false
      } else if (this.dialog.tags) {
        this.dialog.tags = false
      } else if (this.dialog.location) {
        this.dialog.location = false
      } else {
        this.$nuxt.$emit('arrow-back-navigation-form')
      }
      this.cacheInput()
    },
    checkActiveSeriesEvent () {
      if (window.localStorage.getItem('series-event-active') === 'true' || window.localStorage.getItem('series-instant-active') === 'true') {
        if (window.localStorage.getItem('series-event-active') === 'true') {
          this.series.event = true
        } else {
          this.series.instant = true
        }
        this.series.tag = window.localStorage.getItem('series-tag')
        this.series.name = window.localStorage.getItem('series-name')
        this.getSeriesByTag(this.series.tag)
      }
    },
    checkSeriesStatus () {
      if (Date.now() > Date.parse(this.series.data.end)) {
        if (this.series.event) {
          this.leaveActiveSeriesEvent()
        } else if (this.series.instant) {
          this.cancelActiveSeriesInstant()
        }
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
        this.checkSeriesStatus()
      })
    },
    leaveActiveSeriesEvent () {
      window.localStorage.setItem('series-event-active', 'false')
      window.localStorage.setItem('series-tag', '')
      window.localStorage.setItem('series-name', '')
      this.$nuxt.$emit('set-app-color', 'primary')
      this.$nuxt.$emit('update-layout-series')
      this.series.event = false
    },
    cancelActiveSeriesInstant () {
      window.localStorage.setItem('series-instant-active', 'false')
      window.localStorage.setItem('series-tag', '')
      window.localStorage.setItem('series-name', '')
      this.$nuxt.$emit('set-app-color', 'primary')
      this.$nuxt.$emit('update-layout-series')
      this.series.instant = false
    },
    async restoreQuestion () {
      const cache = await this.$localforage.cache.getItem('current-question')
      if (cache) {
        this.input = cache.input
        this.anonymous = cache.anonymous
      }
    },
    async cacheInput () {
      await this.$localforage.cache.setItem('current-question', { input: this.input, anonymous: this.anonymous })
    },
    updateImages (input) {
      this.input.media.images = input.names
      this.files.images = input.files
    },
    checkConsent () {
      if (window.localStorage.getItem('first-question') === 'false') {
        this.firstQuestion = false
      }
      if (window.localStorage.getItem('age-under-sixteen') === 'false') {
        this.ageUnderSixteen = false
      }
      if (window.localStorage.getItem('age-confirmed') === 'true') {
        this.ageConfirmed = true
      }
    },
    checkPermission () {
      if (window.localStorage.getItem('geolocation-permission') === 'true') {
        this.permission.geolocation = true
      } else {
        this.dialog.permission.geolocation = true
      }
      if (window.localStorage.getItem('camera-permission') === 'true') {
        this.permission.camera = true
      }
      if (window.localStorage.getItem('microphone-permission') === 'true') {
        this.permission.microphone = true
      }
    },
    setPermissionGeolocation (val) {
      window.localStorage.setItem('geolocation-permission', val)
      this.permission.geolocation = val
      this.dialog.permission.geolocation = false
      if (val === true) {
        this.setPosition()
        this.trackPosition()
      } else {
        this.manualGeoLocation = true
      }
    },
    setPermissionCamera (val) {
      window.localStorage.setItem('camera-permission', val)
      this.permission.camera = val
      this.dialog.permission.camera = false
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
      this.manualGeoLocation = false
      this.lastAccuracy = locPosition.coords.accuracy
      this.markerCoords = [locPosition.coords.longitude, locPosition.coords.latitude]
      this.lastCoords = [locPosition.coords.longitude, locPosition.coords.latitude]
      this.map.center = [locPosition.coords.longitude, locPosition.coords.latitude]
      this.map.zoom = 14
    },
    trackPositionSuccess (locPosition) {
      this.manualGeoLocation = false
      if (this.manCoords === [0, 0]) {
        this.markerCoords = [locPosition.coords.longitude, locPosition.coords.latitude]
      }
      this.lastAccuracy = locPosition.coords.accuracy
      this.lastCoords = [locPosition.coords.longitude, locPosition.coords.latitude]
    },
    setPositionError () {
      this.manualGeoLocation = true
      this.showSnackbar(this.$t('geo_location_deactivated'))
    },
    trackPositionError () {},
    unregisterPositionWatcher () {
      navigator.geolocation.clearWatch(this.navigatorId)
    },
    centerMap () {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          this.showSnackbar(this.$t('geo_location_deactivated'))
        }
      })
      if (this.lastCoords[0] !== 0 && this.lastCoords[1] !== 0) {
        this.map.center = this.lastCoords
        this.markerCoords = this.lastCoords
      }
    },
    setAge (val) {
      this.ageUnderSixteen = val
      window.localStorage.setItem('age-under-sixteen', val)
      this.ageConfirmed = true
      window.localStorage.setItem('age-confirmed', 'true')
    },
    checkLogin () {
      if (!this.$auth.loggedIn && window.localStorage.getItem('account-connected') === 'true' && this.$nuxt.isOnline) {
        window.localStorage.setItem('redirected-login', 'true')
        window.$nuxt.$router.replace('/login')
      }
    },
    checkInput (input) {
      if (input.question === '') {
        this.showSnackbar(this.$t('alert_input_question'))
        return false
      }
      if (this.markerCoords[0] === 9.8123488 && this.markerCoords[1] === 51.3684384) {
        this.showSnackbar(this.$t('alert_input_location'))
        return false
      }
      if (input.question.length > 200) {
        this.showSnackbar(this.$t('alert_input_question_too_long'))
        return false
      }
      if (input.question.length > 4000) {
        this.showSnackbar(this.$t('alert_input_description_too_long'))
        return false
      }

      return true
    },
    validateInput () {
      if (this.series.event || this.series.instant) {
        if (window.localStorage.getItem('series-tag')) {
          this.input.tags.push(window.localStorage.getItem('series-tag'))
        }
      }
      if (this.input.tags === null) {
        this.input.tags = 0
      }
    },
    createConfig (type) {
      if (this.$auth.getToken('local')) {
        return { headers: { 'Content-Type': type, Authorization: this.$auth.getToken('local') } }
      } else {
        return { headers: { 'Content-Type': type } }
      }
    },
    showSnackbar (message) {
      this.snackbar = false
      this.message = message
      this.snackbar = true
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
    updateAnonymousQuestions (id) {
      if (!this.$auth.loggedIn || this.anonymous) {
        const idList = window.localStorage.getItem('anonymous-questions')
        window.localStorage.setItem('anonymous-questions', idList + id + ',')
      }
    },
    async saveInput (questionUUID, uploadUrl) {
      await this.$localforage.storage.setItem(questionUUID, { input: this.input, datetime: generateTimestamp(), coords: this.markerCoords, files: this.files, url: uploadUrl, anonymous: this.anonymous, accepted: (!this.firstQuestion || this.policiesAccepted) })
    },
    async startUpload () {
      const questionUUID = uuidv4()
      // Quick fix for iOS
      if (!window.localStorage.getItem('thing-id')) {
        window.localStorage.setItem('thing-id', uuidv4())
        window.localStorage.setItem('thing-id-used', window.localStorage.getItem('thing-id') + ',')
      }
      // Quick fix for iOS
      const uploadUrl = null
      if (this.checkInput(this.input)) {
        this.validateInput()
        this.$nuxt.$emit('loading-start')
        await this.saveInput(questionUUID, uploadUrl)
        await this.$localforage.cache.clear()
        window.localStorage.setItem('first-question', 'false')
        this.$nuxt.$emit('upload-question')
        this.$nuxt.$emit('loading-status', { status: true, message: this.$t('loading_success_messsage_question') })
        if (this.series.instant) {
          this.cancelActiveSeriesInstant()
        }
        await window.$nuxt.$router.replace('/home')
      }
    }
  }
}
</script>
