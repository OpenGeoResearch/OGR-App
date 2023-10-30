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
    <v-dialog
      v-model="dialog"
      persistent
      width="290"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('dialog_signup_success_title') }}
        </v-card-title>

        <v-card-text>
          {{ $t('dialog_signup_success_text') }}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            text
            @click="toLogin"
          >
            {{ $t('dialog_next') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <age-confirm-dialog
      v-if="!ageConfirmed"
      @click-age-true="setAge(true)"
      @click-age-false="setAge(false)"
    />

    <info-signup-under-sixteen v-if="ageConfirmed && ageUnderSixteen" />

    <template v-if="ageConfirmed && !ageUnderSixteen">
      <v-form v-model="isFormValid">
        <v-row>
          <v-col align="center">
            <v-alert
              :value="alert"
              outlined
              dense
              type="info"
              text
              transition="scale-transition"
            >
              {{ message }}
            </v-alert>

            <v-text-field
              v-model="singup.username"
              :rules="[rules.required, rules.username]"
              :label="$t('auth_username')"
              outlined
              dense
            />

            <v-text-field
              v-model="singup.email"
              :rules="[rules.required, rules.email]"
              :label="$t('auth_email')"
              outlined
              dense
            />

            <v-text-field
              v-model="singup.password"
              :append-icon="show ? mdiEye : mdiEyeOff"
              :rules="[rules.required, rules.password]"
              :type="show ? 'text' : 'password'"
              :label="$t('auth_password')"
              outlined
              dense
              @click:append="show = !show"
            />

            <v-text-field
              v-model="password2"
              :append-icon="show ? mdiEye : mdiEyeOff"
              :rules="[rules.required, rules.equals]"
              :type="show ? 'text' : 'password'"
              :label="$t('auth_password_repeat')"
              outlined
              dense
              @click:append="show = !show"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="1">
            <v-checkbox
              v-model="checkbox"
              :rules="[rules.checkbox]"
              class="ma-0 pa-0"
            />
          </v-col>
          <v-col>
            {{ $t('auth_terms_one') }} <a target="_blank" :href="ogrWebUrl + '/nutzungsbedingungen'">{{ $t('auth_terms_use') }}</a> {{ $t('auth_terms_two') }} <a target="_blank" :href="ogrWebUrl + '/datenschutz'">{{ $t('auth_terms_data') }}</a> {{ $t('auth_terms_three') }}
          </v-col>
        </v-row>
        <v-row>
          <v-col align="end">
            <v-btn
              :disabled="!isFormValid"
              :loading="loading"
              color="secondary"
              @click="signup"
            >
              {{ $t('auth_register') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </template>
  </v-container>
</template>

<script>
import { mdiEye, mdiEyeOff } from '@mdi/js'
import { v4 as uuidv4 } from 'uuid'
import { createSingup } from '@/util/url-utils.js'
import InfoSignupUnderSixteen from '~/components/info/InfoSignupUnderSixteen.vue'
import AgeConfirmDialog from '~/components/dialog/AgeConfirmDialog'

export default {
  name: 'SignUp',
  components: { AgeConfirmDialog, InfoSignupUnderSixteen },
  layout: 'default',

  data () {
    return {
      mdiEye,
      mdiEyeOff,
      ogrWebUrl: this.$config.ogrWebUrl,
      dialog: false,
      alert: false,
      message: '',
      loader: null,
      loading: false,
      show: false,
      checkbox: false,
      ageConfirmed: false,
      ageUnderSixteen: true,
      singup: {
        username: '',
        email: '',
        password: '',
        thingUUID: ''
      },
      password2: '',
      isFormValid: false,
      rules: {
        required: (value) => { return !!value || this.$t('auth_rule_mandatory') },
        checkbox: (value) => { return !!value || false },
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || this.$t('auth_rule_mail')
        },
        password: (value) => {
          const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,40}$/
          return pattern.test(value) || this.$t('auth_rule_password')
        },
        username: (value) => {
          const pattern = /^[a-zA-Z0-9ÄäÖöÜü\\._-]{3,20}$/
          return pattern.test(value) || this.$t('auth_rule_username')
        },
        equals: (value) => { return value === this.singup.password || this.$t('auth_rule_equals') }
      }
    }
  },

  watch: {
    loader () {
      this.loading = true
      setTimeout(() => (this.timeout()), 10000)
      this.loader = null
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_signup'))
    if (window.localStorage.getItem('age-under-sixteen') === 'false') {
      this.ageUnderSixteen = false
    }
    if (window.localStorage.getItem('age-confirmed') === 'true') {
      this.ageConfirmed = true
    }
  },

  methods: {
    timeout () {
      if (this.loading) {
        this.showAlert(this.$t('alert_network_error'))
      }
    },
    showAlert (message) {
      this.message = message
      this.loading = false
      this.alert = true
    },
    setAge (val) {
      this.ageUnderSixteen = val
      window.localStorage.setItem('age-under-sixteen', val)
      this.ageConfirmed = true
      window.localStorage.setItem('age-confirmed', 'true')
      this.$nuxt.$emit('update-user-status')
    },
    toLogin () {
      this.dialog = false
      window.$nuxt.$router.replace('/login')
    },
    signup () {
      this.loader = 'loading'
      window.localStorage.setItem('thing-id', uuidv4())
      this.singup.thingUUID = window.localStorage.getItem('thing-id')
      const payload = createSingup(this.singup, this.checkbox)
      const config = { headers: { 'Content-Type': 'application/json' } }
      this.$axios.post('/ogr/auth/signup', payload, config)
        .then((response) => {
          this.loading = false
          if (response.status === 200) {
            window.localStorage.setItem('account-connected', 'true')
            this.$nuxt.$emit('update-user-status')
            this.dialog = true
          } else {
            this.showAlert(this.$t('alert_occurred_error'))
          }
        })
        .catch((err) => {
          if (err.message === 'Network Error') {
            this.showAlert(this.$t('alert_network_error'))
          } else {
            this.showAlert(this.$t('alert_signup_error'))
          }
        })
    }
  }
}
</script>
