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
          {{ $t('dialog_success') }}
        </v-card-title>

        <v-card-text>
          {{ $t('dialog_login_success') }}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            text
            @click="toHome"
          >
            {{ $t('dialog_next') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-form v-model="isFormValid">
      <v-row no-gutters>
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
            v-model="login.username"
            :rules="[rules.required]"
            :label="$t('auth_username')"
            outlined
            dense
          />

          <v-text-field
            v-model="login.password"
            class="mb-0"
            :append-icon="show ? mdiEye : mdiEyeOff"
            :rules="[rules.required]"
            :type="show ? 'text' : 'password'"
            name="input-10-2"
            :label="$t('auth_password')"
            outlined
            dense
            @click:append="show = !show"
          />
        </v-col>
      </v-row>
      <v-row
        align="end"
        no-gutters
      >
        <v-spacer />
        <a class="ma-2 ba-0" :href="ogrMapUrl + '/account/forgotpw'">
          {{ $t('auth_reset_user_password') }}
        </a>
      </v-row>
      <v-row no-gutters>
        <v-col align="end">
          <v-btn
            :disabled="!isFormValid"
            :loading="loading"
            color="secondary"
            @click="userLogin"
          >
            {{ $t('auth_login') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { mdiEye, mdiEyeOff } from '@mdi/js'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'UserLogin',
  layout: 'default',

  data () {
    return {
      ogrMapUrl: this.$config.ogrMapUrl,
      mdiEye,
      mdiEyeOff,
      dialog: false,
      alert: false,
      message: '',
      loader: null,
      loading: false,
      show: false,
      login: {
        username: '',
        password: ''
      },
      isFormValid: false,
      rules: {
        required: (value) => { return !!value || this.$t('auth_rule_mandatory') }
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
    this.$nuxt.$emit('set-app-title', this.$t('page_title_login'))
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
    toHome () {
      this.dialog = false
      if (window.localStorage.getItem('redirected-login') === 'true') {
        window.localStorage.setItem('redirected-login', 'false')
        window.$nuxt.$router.replace('/question')
      } else {
        window.$nuxt.$router.replace('/home')
      }
    },
    async userLogin () {
      this.loader = 'loading'
      window.localStorage.setItem('thing-id', uuidv4())
      try {
        const response = await this.$auth.loginWith('local', { data: this.login })
        this.$auth.setUser(response.data)
        this.loading = false
        if (response.status === 200) {
          window.localStorage.setItem('account-connected', 'true')
          this.dialog = true
        }
        this.$nuxt.$emit('update-user-status')
      } catch (err) {
        if (err.message === 'Network Error') {
          this.showAlert(this.$t('alert_network_error'))
        } else if (err.message === 'Request failed with status code 400') {
          this.showAlert(this.$t('alert_wrong_credentials'))
        } else {
          this.showAlert(this.$t('alert_login_failed'))
        }
      }
    }
  }
}
</script>
