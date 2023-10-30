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
          {{ $t('dialog_claim_success') }}
        </v-card-title>

        <v-card-text>
          {{ $t('dialog_claim_info') }}
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

    <client-only>
      <v-row v-if="!this.$auth.loggedIn">
        <v-col align="left">
          <info-card
            :title="$t('claim_card_title_1')"
            :subtitle="$t('claim_card_subtitle_1')"
            :text="$t('claim_card_text_1')"
          >
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="toLogin"
              >
                {{ $t('dialog_to_login') }}
              </v-btn>
            </v-card-actions>
          </info-card>
        </v-col>
      </v-row>
    </client-only>

    <client-only>
      <v-form
        v-if="this.$auth.loggedIn"
        v-model="isFormValid"
      >
        <v-row>
          <v-col align="left">
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

            <info-card
              :title="$t('claim_card_title_2')"
              :subtitle="$t('claim_card_subtitle_2')"
              :text="$t('claim_card_text_2')"
            />
          </v-col>
        </v-row>

        <v-row
          v-if="questions"
        >
          <v-col align="left">
            <v-text-field
              v-model="data.password"
              :append-icon="show ? mdiEye : mdiEyeOff"
              :rules="[rules.required, rules.password]"
              :type="show ? 'text' : 'password'"
              :label="$t('auth_password')"
              outlined
              dense
              @click:append="show = !show"
            />
          </v-col>
        </v-row>

        <v-row
          v-if="questions"
        >
          <v-col align="end">
            <v-btn
              :disabled="!isFormValid"
              :loading="loading"
              color="secondary"
              @click="startClaiming"
            >
              {{ $t('claim_form_action') }}
            </v-btn>
          </v-col>
        </v-row>

        <v-row
          v-else
        >
          <v-col align="left">
            <v-alert
              outlined
              dense
              type="info"
              text
              transition="scale-transition"
            >
              {{ $t('claim_no_questions') }}
            </v-alert>
          </v-col>
        </v-row>
      </v-form>
    </client-only>
  </v-container>
</template>

<script>
import { mdiEye, mdiEyeOff } from '@mdi/js'
import InfoCard from '~/components/info/InfoCard.vue'

export default {
  name: 'ClaimAccount',
  components: { InfoCard },
  layout: 'default',

  data () {
    return {
      mdiEye,
      mdiEyeOff,
      dialog: false,
      alert: false,
      message: '',
      loader: null,
      loading: false,
      show: false,
      isFormValid: false,
      questions: true,
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

  watch: {
    loader () {
      this.loading = true
      setTimeout(() => (this.timeout()), 10000)
      this.loader = null
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_claim'))
  },

  mounted () {
    this.checkQuestions()
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
    createConfig (type) {
      if (this.$auth.getToken('local')) {
        return { headers: { 'Content-Type': type, Authorization: this.$auth.getToken('local') } }
      } else {
        return { headers: { 'Content-Type': type } }
      }
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
    toLogin () {
      window.$nuxt.$router.replace('/login')
    },
    toHome () {
      this.dialog = false
      window.$nuxt.$router.replace('/home')
    },
    checkQuestions () {
      const anonymousQuestionIds = window.localStorage.getItem('anonymous-questions')
      if (!(anonymousQuestionIds !== null && anonymousQuestionIds !== '')) {
        this.questions = false
      }
    },
    async startClaiming () {
      this.loading = true
      try {
        let usedThingIds = window.localStorage.getItem('thing-id-used')
        if (usedThingIds !== null && usedThingIds !== '') {
          usedThingIds = usedThingIds.slice(0, -1).split(',')
        } else {
          usedThingIds = false
        }
        if (this.$nuxt.isOnline && usedThingIds) {
          await this.claim(usedThingIds)
          window.localStorage.setItem('account-connected', 'true')
          window.localStorage.setItem('anonymous-questions', '')
          window.localStorage.setItem('thing-id-used', '')
          this.dialog = true
          this.loading = false
        }
      } catch (err) {
        this.loading = false
        if (err.message === 'Request Error') {
          this.showAlert(this.$t('alert_request_error'))
          this.sendErrorReport(1, err)
        } else if (err.message === 'Network Error') {
          this.showAlert(this.$t('alert_network_error'))
          this.sendErrorReport(2, err)
        } else if (err.message === 'Unknown Error') {
          this.showAlert(this.$t('alert_unknown_error'))
          this.sendErrorReport(3, err)
        } else {
          this.showAlert(this.$t('alert_unexpected_error'))
          this.sendErrorReport(4, err)
        }
      }
    },
    claim (usedThingIds) {
      this.loading = true
      const data = { password: this.data.password, pwaSecret: this.$config.secretForClaim, thingUUIDs: usedThingIds }
      const config = { headers: { Authorization: this.$auth.getToken('local') } }

      return new Promise(function (resolve, reject) {
        window.$nuxt.$axios.post('/ogr/auth/claim', data, config)
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
