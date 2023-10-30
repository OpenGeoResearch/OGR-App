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
      v-if="dialog.geolocation"
      :title="$t('permission_geolocation_title')"
      :text="$t('permission_geolocation_text')"
      :demand="$t('permission_geolocation_demand')"
      :allow="$t('permission_geolocation_allow')"
      @change-permission-allow="activateGeolocation"
      @change-permission-deny="dialog.geolocation=false"
    />

    <reset-dialog
      v-if="dialog.reset"
      @change-reset-allow="reset"
      @change-reset-deny="dialog.reset=false"
    />

    <feedback-dialog
      v-if="dialog.feedback"
      @click-close-feedback="dialog.feedback=false"
    />

    <delete-account-dialog
      v-if="dialog.deleteAccount"
      @change-delete-deny="dialog.deleteAccount=false"
    />

    <v-row align="center">
      <v-col justify="center">
        <v-divider />
        <v-list-item two-line>
          <v-list-item-action align="center">
            <v-icon>
              {{ mdiTranslate }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('settings_language_title') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('settings_language_subtitle') }}</v-list-item-subtitle>
              </v-col>
              <v-col no-gutters>
                <v-row align="center" justify="end">
                  <v-select
                    v-model="selectedLocale"
                    :items="availableLocales"
                    item-text="code"
                    item-value="code"
                    dense
                    :disabled="language"
                    style="max-width: 70px;"
                  />
                </v-row>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-divider />

        <v-list-item two-line>
          <v-list-item-action align="center">
            <v-icon>
              {{ mdiThemeLightDark }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('settings_theme_title') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('settings_theme_subtitle') }}</v-list-item-subtitle>
              </v-col>
              <v-col no-gutters>
                <v-row align="center" justify="end">
                  <v-switch
                    v-model="theme"
                    inset
                    flat
                    color="highlight"
                    @click="toggleDarkMode"
                  />
                </v-row>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-divider />

        <v-list-item two-line>
          <v-list-item-action align="center">
            <v-icon>
              {{ permission.geolocation ? mdiMapMarker : mdiMapMarkerOff }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('settings_geolocation_title') }}</v-list-item-title>
                <v-list-item-subtitle>{{ permission.geolocation ? $t('settings_geolocation_subtitle_allowed') : $t('settings_geolocation_subtitle_denied') }}</v-list-item-subtitle>
              </v-col>
              <v-col no-gutters>
                <v-row align="center" justify="end">
                  <v-switch
                    v-if="!permission.geolocation"
                    value="false"
                    readonly
                    inset
                    flat
                    color="highlight"
                    @click="dialog.geolocation=true"
                  />
                </v-row>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-divider />

        <v-list-item
          two-line
          :disabled="!feedback"
        >
          <v-list-item-action align="center">
            <v-icon>
              {{ mdiCommentQuote }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content
            @click="dialog.feedback=true"
          >
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('settings_feedback_title') }}</v-list-item-title>
                <v-list-item-subtitle v-if="feedback">{{ $t('settings_feedback_subtitle') }}</v-list-item-subtitle>
                <v-list-item-subtitle v-else>{{ $t('settings_feedback_subtitle_hint') }}</v-list-item-subtitle>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-divider />

        <v-list-item two-line>
          <v-list-item-action align="center">
            <v-icon>
              {{ mdiRestartAlert }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content
            @click="dialog.reset=true"
          >
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('settings_reset_title') }}</v-list-item-title>
                <v-list-item-subtitle>{{ $t('settings_reset_subtitle') }}</v-list-item-subtitle>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-divider v-if="false" />

        <v-list-item
          v-if="false"
          two-line
        >
          <v-list-item-action align="center">
            <v-icon>
              {{ mdiTools }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content
            @click="toRepair"
          >
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>Reparieren</v-list-item-title>
                <v-list-item-subtitle>Probleme mit der App beheben</v-list-item-subtitle>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-divider />

        <v-list-item
          two-line
          :disabled="!deleteAccount"
        >
          <v-list-item-action align="center">
            <v-icon
              color="accent"
            >
              {{ mdiAccountRemove }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content
            @click="dialog.deleteAccount=true"
          >
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title class="accent--text">{{ $t('settings_delete_title') }}</v-list-item-title>
                <v-list-item-subtitle v-if="deleteAccount">{{ $t('settings_delete_subtitle') }}</v-list-item-subtitle>
                <v-list-item-subtitle v-else>{{ $t('settings_delete_subtitle_hint') }}</v-list-item-subtitle>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiTranslate, mdiThemeLightDark, mdiMapMarker, mdiMapMarkerOff, mdiCommentQuote, mdiRestartAlert, mdiAccountRemove, mdiTools, mdiBug } from '@mdi/js'
import PermissionDialog from '~/components/dialog/PermissionDialog.vue'
import ResetDialog from '~/components/dialog/ResetDialog.vue'
import FeedbackDialog from '~/components/dialog/FeedbackDialog'
import DeleteAccountDialog from '~/components/dialog/DeleteAccountDialog'

export default {
  name: 'Settings',
  components: { DeleteAccountDialog, FeedbackDialog, PermissionDialog, ResetDialog },
  layout: 'default',

  data () {
    return {
      mdiTranslate,
      mdiThemeLightDark,
      mdiMapMarker,
      mdiMapMarkerOff,
      mdiCommentQuote,
      mdiRestartAlert,
      mdiAccountRemove,
      mdiTools,
      mdiBug,
      language: false,
      feedback: false,
      deleteAccount: false,
      dialog: {
        report: false,
        geolocation: false,
        reset: false,
        feedback: false,
        error: false,
        deleteAccount: false,
        debug: false
      },
      theme: false,
      permission: {
        geolocation: false
      },
      navigatorId: undefined,
      errorReports: undefined
    }
  },

  computed: {
    availableLocales () {
      return this.$i18n.locales
    },
    selectedLocale: {
      get () {
        return this.$i18n.locale
      },
      set (newValue) {
        if (newValue !== this.$i18n.locale) {
          this.$i18n.setLocale(newValue)
        }
      }
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_settings'))
  },

  created () {
    this.$nuxt.$on('click-close-feedback', () => {
      this.dialog.feedback = false
    })
    this.$nuxt.$on('change-logout-now', () => {
      this.accountDeleted()
    })
  },

  mounted () {
    if (!this.$nuxt.isOnline) {
      this.language = true
    }
    if (this.$auth.loggedIn) {
      this.feedback = true
      this.deleteAccount = true
    }
    this.theme = this.$vuetify.theme.dark
    if (window.localStorage.getItem('geolocation-permission') === 'true') {
      this.permission.geolocation = true
    }
  },

  beforeDestroy () {
    this.$nuxt.$off('click-close-feedback')
    this.$nuxt.$off('change-logout-now')
  },

  methods: {
    toggleDarkMode () {
      this.$vuetify.theme.dark = this.theme
      window.localStorage.setItem('theme', this.theme)
    },
    activateGeolocation () {
      window.localStorage.setItem('geolocation-permission', 'true')
      this.permission.geolocation = true
      this.setPosition()
      this.dialog.geolocation = false
    },
    setPosition () {
      if (navigator.geolocation) {
        this.navigatorId = navigator.geolocation.getCurrentPosition((position) => {})
      } else {
        alert('Browser doesn\'t support Geolocation')
      }
    },
    accountDeleted () {
      window.localStorage.setItem('account-connected', null)
      this.dialog.feedback = false
      this.$auth.logout()
      location.reload()
    },
    async reset () {
      this.$auth.logout()
      window.localStorage.clear()
      await this.$localforage.cache.clear
      await this.$localforage.storage.clear
      this.$nuxt.$emit('update-user-status')
      this.dialog.reset = false
      location.reload()
    },
    toRepair () {
      window.$nuxt.$router.replace('/repair')
    }
  }
}
</script>
