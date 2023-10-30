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
  >
    <v-form v-model="isFormValid">
      <v-card>
        <v-card-title class="headline">
          <span>{{ $t('settings_feedback_title') }}</span>
          <v-spacer />
          <v-btn
            icon
            @click="$emit('click-close-feedback')"
          >
            <v-icon
              right
            >
              {{ mdiClose }}
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          {{ $t('feedback_text') }}
        </v-card-text>
        <v-card-text align="center">
          <v-textarea
            v-model="input"
            name="input"
            :rules="[rules.length(4000), rules.required]"
            counter="4000"
            outlined
            autofocus
            no-resize
            :label="$t('feedback_hint')"
            placeholder=""
            rows="4"
          />
        </v-card-text>
        <v-card-text align="center">
          <v-btn
            :disabled="!isFormValid"
            color="success"
            @click="submit"
          >
            {{ $t('feedback_submit') }}
          </v-btn>
        </v-card-text>
      </v-card>
      <info-snackbar
        :show="snackbar"
        :message="message"
        @click-snackbar="snackbar = false"
      />
    </v-form>
  </v-dialog>
</template>

<script>
import { mdiClose } from '@mdi/js'
import InfoSnackbar from '~/components/info/InfoSnackbar'

export default {
  name: 'FeedbackDialog',
  components: { InfoSnackbar },
  data () {
    return {
      mdiClose,
      show: true,
      input: undefined,
      snackbar: false,
      message: '',
      isFormValid: false,
      rules: {
        length: len => v => (v || '').length <= len || this.$t('input_text_length', [len]),
        required: (value) => { return !!value || this.$t('auth_rule_mandatory') }
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
          const uploadFeedbackResponse = await this.uploadFeedback()
          if (uploadFeedbackResponse) {
            this.$nuxt.$emit('click-close-feedback')
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
        this.$nuxt.$emit('click-close-feedback')
      }
    },

    uploadFeedback () {
      const request = { username: this.$auth.user.username, text: this.input, origin: 'app' }
      const config = this.createConfig('application/json')
      return new Promise(function (resolve, reject) {
        window.$nuxt.$axios.post('/ogr/feedback/', request, config)
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
