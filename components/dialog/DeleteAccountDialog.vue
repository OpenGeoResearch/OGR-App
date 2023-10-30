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
  <v-dialog
    v-model="show"
    persistent
    width="290"
  >
    <v-card color="caution">
      <v-card-title class="headline white--text">
        {{ $t('delete_account_title') }}
      </v-card-title>
      <v-card-text class="white--text">
        {{ $t('delete_account_text') }}
      </v-card-text>
      <v-card-text class="white--text">
        {{ $t('delete_account_demand') }}
      </v-card-text>
      <v-form v-model="isFormValid">
        <v-text-field
          v-model="data.password"
          class="pl-3 pr-3"
          :append-icon="showpw ? mdiEye : mdiEyeOff"
          :rules="[rules.required, rules.password]"
          :type="showpw ? 'text' : 'password'"
          :label="$t('auth_password')"
          color="white"
          outlined
          dense
          @click:append="showpw = !showpw"
        />
        <v-card-text align="center">
          <v-btn
            color="error"
            x-small
            :disabled="!isFormValid"
            @click="submit"
          >
            {{ $t('delete_account_allow') }}
          </v-btn>
        </v-card-text>
        <v-card-text align="center">
          <v-btn
            @click="$emit('change-delete-deny')"
          >
            {{ $t('delete_account_deny') }}
          </v-btn>
        </v-card-text>
      </v-form>
    </v-card>
    <info-snackbar
      :show="snackbar"
      :message="message"
      @click-snackbar="snackbar = false"
    />
  </v-dialog>
</template>

<script>
import { mdiEye, mdiEyeOff } from '@mdi/js'
import InfoSnackbar from '~/components/info/InfoSnackbar'
export default {
  name: 'DeleteAccountDialog',
  components: { InfoSnackbar },
  data () {
    return {
      mdiEye,
      mdiEyeOff,
      show: true,
      showpw: false,
      isFormValid: false,
      snackbar: false,
      message: '',
      data: {
        password: ''
      },
      rules: {
        required: (value) => { return !!value || this.$t('auth_rule_mandatory') },
        password: (value) => {
          const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,40}$/
          return pattern.test(value) || false
        }
      }
    }
  },

  methods: {
    showSnackbar (message) {
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
    createConfig (type) {
      if (this.$auth.getToken('local')) {
        return { headers: { 'Content-Type': type, Authorization: this.$auth.getToken('local') } }
      } else {
        return { headers: { 'Content-Type': type } }
      }
    },

    async submit () {
      this.show = false
      try {
        if (this.$nuxt.isOnline) {
          const uploadDeleteAccountResponse = await this.deleteAccount()
          if (uploadDeleteAccountResponse) {
            this.$nuxt.$emit('change-logout-now')
          }
        } else {
          throw new Error('Network Error')
        }
      } catch (err) {
        if (err.message === 'Request Error') {
          this.showSnackbar(this.$t('alert_request_error'))
          this.sendErrorReport(1, err)
        } else if (err.message === 'Network Error') {
          this.showSnackbar(this.$t('alert_network_error'))
          this.sendErrorReport(2, err)
        } else if (err.message === 'Unknown Error') {
          this.showSnackbar(this.$t('alert_unknown_error'))
          this.sendErrorReport(3, err)
        } else {
          this.showSnackbar(this.$t('alert_unexpected_error'))
          this.sendErrorReport(4, err)
        }
        this.$nuxt.$emit('change-delete-deny')
      }
    },

    deleteAccount () {
      const request = { username: this.$auth.user.username, password: this.data.password }
      const config = this.createConfig('application/json')
      return new Promise(function (resolve, reject) {
        window.$nuxt.$axios.post('/ogr/auth/delete', request, config)
          .then((response) => {
            if (response.status === 200) {
              return resolve(response)
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
