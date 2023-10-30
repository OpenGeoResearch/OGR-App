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
  <v-app>
    <v-navigation-drawer
      v-if="form === false"
      v-model="drawer"
      app
    >
      <template #prepend>
        <v-list-item two-line>
          <v-list-item-avatar>
            <img src="/avatar.png">
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>OpenGeoResearch</v-list-item-title>
            <client-only>
              <v-list-item-subtitle v-if="user">
                {{ user.username }}
              </v-list-item-subtitle>
              <v-list-item-subtitle v-if="!user">
                {{ $t('layout_default_subtitle') }}
              </v-list-item-subtitle>
            </client-only>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider />

      <v-list>
        <v-list-item
          link
          to="/home"
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ mdiHome }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('layout_default_home') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          link
          to="/account"
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ mdiHeadQuestion }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('layout_default_account') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          link
          to="/find"
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ mdiTextSearch }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('layout_default_all_questions') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          link
          to="/explore"
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ mdiCompass }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('layout_default_explore') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          link
          to="/series"
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ mdiMapMarkerMultiple }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('layout_default_series') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider inset />

        <client-only>
          <v-list-item
            v-if="userIsLoggedIn === false && !account && !ageUnderSixteen"
            link
            to="/signup"
            nuxt
          >
            <v-list-item-action>
              <v-icon>{{ mdiAccountPlus }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('layout_default_signup') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-if="userIsLoggedIn && anon !== null && account && !ageUnderSixteen"
            link
            to="/claim"
            nuxt
          >
            <v-list-item-action>
              <v-icon>{{ mdiAccountCheck }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('layout_default_claim') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-if="userIsLoggedIn && !ageUnderSixteen"
            link
            to="/logout"
            nuxt
          >
            <v-list-item-action>
              <v-icon>{{ mdiLogout }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('auth_logout') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-if="userIsLoggedIn === false && !ageUnderSixteen"
            link
            to="/login"
            nuxt
          >
            <v-list-item-action>
              <v-icon>{{ mdiLogin }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t('auth_login') }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="!ageUnderSixteen" inset />
        </client-only>

        <v-list-item
          link
          to="/settings"
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ mdiCog }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('layout_default_settings') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          link
          to="/about"
          nuxt
        >
          <v-list-item-action>
            <v-icon>{{ mdiInformation }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t('layout_default_about') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider inset />

        <v-list-item
          link
          to="/question"
          nuxt
        >
          <v-list-item-action>
            <v-icon
              :color="isSeriesActive ? 'info' : 'secondary'"
            >
              {{ mdiPlusCircle }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ isSeriesActive ? $t('layout_default_observation') : $t('layout_default_question') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider inset />
      </v-list>

      <v-list
        style="position: fixed !important; bottom: 0 !important; width: 100%"
        color="#24318A"
      >
        <v-list-item
          link
          to="/info"
          nuxt
        >
          <v-list-item-action>
            <v-icon color="#E5006C">
              {{ mdiCommentQuestion }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title class="white--text">
              {{ $t('layout_default_wsj') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-dialog
      v-model="dialogQuestion"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('layout_form_dialog_title') }}
        </v-card-title>

        <v-card-text>
          {{ $t('layout_form_dialog_text') }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="secondary"
            text
            @click="closeFormKeep"
          >
            {{ $t('action_keep') }}
          </v-btn>

          <v-btn
            color="secondary"
            text
            @click="closeFormDiscard"
          >
            {{ $t('action_discard') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogSync"
      transition="scale-transition"
      origin="top right"
    >
      <v-card class="text-center">
        <v-card-title>
          <v-spacer />
          {{ sync ? $t('sync_dialog_title_progress') : $t('sync_dialog_title') }}
          <v-spacer />
        </v-card-title>

        <v-card-text>
          <v-flex style="height:40vh !important;" class="overflow-y-auto">
            <div v-if="backgroundProgess.length > 0">
              <div
                v-for="(element, index) in backgroundProgess"
                :key="index"
              >
                <span v-if="index === 0" class="font-weight-bold">{{ element }}</span>
                <span v-else>{{ element }}</span>
                <br>
              </div>
            </div>
            <div v-else>
              <div>
                <v-card-text class="ml-0 pl-0 mr-0 pr-0">
                  {{ $t('sync_dialog_text_info') }}
                </v-card-text>
                <v-card-text class="ml-0 pl-0 mr-0 pr-0 mt-0">
                  <span v-if="questionsToSync === 0">{{ $t('sync_dialog_text_progress_none_1') }}<b>{{ $t('sync_dialog_text_progress_none_2') }}</b>{{ $t('sync_dialog_text_progress_none_3') }}</span>
                  <span v-else-if="questionsToSync === 1">{{ $t('sync_dialog_text_progress_one_1') }}<b>{{ $t('sync_dialog_text_progress_one_2') }}</b>{{ $t('sync_dialog_text_progress_one_3') }}</span>
                  <span v-else>{{ $t('sync_dialog_text_progress_multi_1') }}<b>{{ questionsToSync }}{{ $t('sync_dialog_text_progress_multi_2') }}</b>{{ $t('sync_dialog_text_progress_multi_3') }}</span>
                </v-card-text>
                <v-btn
                  class="mt-2"
                  color="secondary"
                  :disabled="questionsToSync === 0"
                  @click="synchronize"
                >
                  {{ $t('sync_dialog_button_synchronize') }}
                </v-btn>
              </div>
            </div>
          </v-flex>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="dialogSync = false"
          >
            {{ $t('sync_dialog_button_hide') }}
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-app-bar
      app
      :color="appColor"
      dark
      height="56"
    >
      <v-app-bar-nav-icon
        v-if="form"
        @click.stop="dialogQuestion = true"
      >
        <v-icon>{{ mdiArrowLeft }}</v-icon>
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon
        v-else
        @click.stop="drawer = !drawer"
      />

      <v-spacer />

      <v-toolbar-title v-if="form"></v-toolbar-title>
      <v-toolbar-title v-else>{{ title }}</v-toolbar-title>

      <v-spacer />

      <v-btn
        v-if="form"
        text
        dark
        @click="checkForm"
      >
        {{ isSeriesActive ? $t('action_contribute') : $t('action_send') }}
      </v-btn>
      <v-progress-circular
        v-else
        width="1"
        :color="sync ? 'white': appColor"
        :indeterminate="true"
      >
        <v-badge
          :color="appColor === 'primary' ? 'info' : 'accent'"
          :value="questionsToSync > 0"
          :content="questionsToSync"
          offset-x="5"
          offset-y="10"
        >
          <v-icon
            color="white"
            @click="dialogSync = true"
          >
            {{ mdiCloudUploadOutline }}
          </v-icon>
        </v-badge>
      </v-progress-circular>
    </v-app-bar>

    <v-main>
      <loading-dialog
        :show="loading"
        :success="loaded === true"
        :error="loaded === false"
        :message="message"
      />
      <v-container
        class="pa-0"
        fluid
        fill-height
        style="align-items: start"
      >
        <nuxt />
      </v-container>
    </v-main>

    <v-footer
      :color="appColor"
      app
      height="36"
    >
      <span class="white--text">OpenGeoResearch</span>
    </v-footer>
  </v-app>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import {
  mdiHome,
  mdiHeadQuestion,
  mdiMapSearch,
  mdiAccountPlus,
  mdiAccountCheck,
  mdiLogout,
  mdiLogin,
  mdiCog,
  mdiInformation,
  mdiPlusCircle,
  mdiCommentQuestion,
  mdiCompass,
  mdiTextSearch,
  mdiArrowLeft,
  mdiCloudUploadOutline,
  mdiMapMarkerMultiple
} from '@mdi/js'
import LoadingDialog from '~/components/dialog/LoadingDialog'

export default {
  components: { LoadingDialog },
  data () {
    return {
      ogrApiUrl: this.$config.ogrApiUrl,
      mdiHome,
      mdiHeadQuestion,
      mdiMapSearch,
      mdiAccountPlus,
      mdiAccountCheck,
      mdiLogout,
      mdiLogin,
      mdiCog,
      mdiInformation,
      mdiPlusCircle,
      mdiCommentQuestion,
      mdiCompass,
      mdiTextSearch,
      mdiArrowLeft,
      mdiCloudUploadOutline,
      mdiMapMarkerMultiple,
      drawer: null,
      account: false,
      user: null,
      anon: null,
      ageUnderSixteen: false,
      userIsLoggedIn: false,
      loading: false,
      loaded: undefined,
      sync: false,
      dialogSync: false,
      dialogQuestion: false,
      form: false,
      message: '',
      questionsToSync: 0,
      questionsSynced: 0,
      backgroundProgess: [],
      appColor: 'primary',
      title: 'OpenGeoResearch',
      isSeriesActive: false
    }
  },

  watch: {
    async dialogSync () {
      await this.updateQuestionsToSync()
    }
  },

  created () {
    this.$nuxt.$on('update-layout-form', (val) => {
      this.form = val
    })
    this.$nuxt.$on('update-layout-series', () => {
      this.checkActiveSeriesEvent()
    })
    this.$nuxt.$on('upload-question', async () => {
      await this.updateQuestionsToSync()
      this.synchronize()
    })
    this.$nuxt.$on('arrow-back-navigation-form', () => {
      this.dialogQuestion = true
    })
    this.$nuxt.$on('update-user-status', () => {
      this.updateDrawer()
    })
    this.$nuxt.$on('set-app-color', (color) => {
      this.setAppColor(color)
    })
    this.$nuxt.$on('set-app-title', (title) => {
      this.title = title
    })
    this.$nuxt.$on('loading-start', () => {
      this.loaded = undefined
      this.loading = true
    })
    this.$nuxt.$on('loading-status', (args) => {
      this.message = args.message
      setTimeout(() => (this.loaded = args.status), 300)
      setTimeout(() => (this.loading = false), 1500)
    })
  },

  beforeMount () {
    this.updateTheme()
    screen.orientation.lock('portrait')
    if (!window.localStorage.getItem('thing-id')) {
      window.localStorage.setItem('thing-id-used', '')
    }
    this.updateDrawer()
    this.$nuxt.$on('arrow-back-navigation', () => {
      window.$nuxt.$router.back()
    })
  },

  async mounted () {
    await this.updateQuestionsToSync()
    if (this.questionsToSync > 0) {
      this.synchronize()
    }
  },

  beforeDestroy () {
    this.$nuxt.$off('update-layout-form')
    this.$nuxt.$off('update-layout-series')
    this.$nuxt.$off('update-user-status')
    this.$nuxt.$off('upload-question')
    this.$nuxt.$off('arrow-back-navigation')
    this.$nuxt.$off('arrow-back-navigation-form')
    this.$nuxt.$off('set-app-color')
    this.$nuxt.$off('set-app-title')
    this.$nuxt.$off('loading-start')
    this.$nuxt.$off('loading-status')
  },

  methods: {
    checkActiveSeriesEvent () {
      if (window.localStorage.getItem('series-event-active') === 'true' || window.localStorage.getItem('series-instant-active') === 'true') {
        this.isSeriesActive = true
      } else {
        this.isSeriesActive = false
      }
    },
    async updateQuestionsToSync () {
      const keys = await this.$localforage.storage.keys()
      this.questionsToSync = keys.length
    },
    synchronize () {
      if (process.client && this.sync === false && this.$nuxt.isOnline) {
        this.questionsSynced = 0
        this.backgroundProgess = []

        const worker = this.$worker.createWorker()
        this.backgroundProgess.unshift(this.$t('sync_progress_background_task_started'))

        if (worker) {
          worker.onmessage = async (event) => {
            if (event.data.msg === 'update-progress-info') {
              this.backgroundProgess.unshift(this.$t(event.data.info))
            } else if (event.data.msg === 'update-progress-info-number') {
              this.backgroundProgess.unshift(this.$tc(event.data.info, event.data.number))
            } else if (event.data.msg === 'update-anonymous-questions') {
              if (!this.$auth.loggedIn || event.data.anonymous) {
                const idList = window.localStorage.getItem('anonymous-questions')
                window.localStorage.setItem('anonymous-questions', idList + event.data.id + ',')
              }
            } else if (event.data.msg === 'sync-completed') {
              this.sync = false
              worker.onmessage = null
              worker.terminate()
              this.backgroundProgess.unshift(this.$t('sync_progress_background_task_ended'))
              setTimeout(() => (this.backgroundProgess = []), 15000)
              await this.updateQuestionsToSync()
            }
          }
        }

        if (worker) {
          const thingUUID = window.localStorage.getItem('thing-id')
          if (this.$nuxt.isOnline) {
            worker.postMessage({
              action: 'synchronize',
              thingUUID,
              token: this.$auth.getToken('local'),
              ogrApiUrl: this.ogrApiUrl
            })
            this.sync = true
          } else {
            this.terminateWorker(worker)
          }
        }
      }
    },
    terminateWorker (worker) {
      this.sync = false
      worker.onmessage = null
      worker.terminate()
    },
    closeFormDiscard () {
      this.$localforage.cache.clear()
      if (window.localStorage.getItem('series-instant-active') === 'true') {
        window.localStorage.setItem('series-instant-active', 'false')
        window.localStorage.setItem('series-tag', '')
        window.localStorage.setItem('series-name', '')
        this.$nuxt.$emit('set-app-color', 'primary')
      }
      this.$nuxt.$router.replace('/home')
      this.dialogQuestion = false
    },
    closeFormKeep () {
      window.$nuxt.$router.replace('/home')
      this.dialogQuestion = false
    },
    checkForm () {
      this.$nuxt.$emit('check-form')
    },
    updateDrawer () {
      if (window.localStorage.getItem('account-connected') === 'true') {
        this.account = true
      } else {
        this.account = false
      }
      this.anon = window.localStorage.getItem('anonymous-questions')
      this.user = this.$auth.user
      if (this.$auth.loggedIn) {
        this.userIsLoggedIn = true
      } else {
        this.userIsLoggedIn = false
      }

      if (window.localStorage.getItem('age-under-sixteen') === 'true') {
        this.ageUnderSixteen = true
      }
      if (!window.localStorage.getItem('thing-id')) {
        window.localStorage.setItem('thing-id', uuidv4())
        window.localStorage.setItem('thing-id-used', window.localStorage.getItem('thing-id') + ',')
      }
      this.$forceUpdate()
    },
    updateTheme () {
      if (window.localStorage.getItem('theme') === 'true') {
        this.$vuetify.theme.dark = true
      }
      if (window.localStorage.getItem('series-event-active') === 'true' || window.localStorage.getItem('series-event-instant') === 'true') {
        this.appColor = 'info'
      }
    },
    setAppColor (color) {
      this.appColor = color
      this.checkActiveSeriesEvent()
    }
  }
}
</script>

<style>
body
{
  overscroll-behavior: none;
}
</style>
