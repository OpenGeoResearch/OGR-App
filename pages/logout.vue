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
    <v-row v-if="!loggedOut">
      <v-col>
        <info-card
          class="mb-2"
          :title="$t('auth_logout_info_title')"
          :subtitle="$t('auth_logout_info_subtitle')"
        />
      </v-col>
    </v-row>
    <v-row v-if="!loggedOut">
      <v-col align="center">
        <v-btn
          class="mt-3"
          color="secondary"
          @click="userLogout"
        >
          {{ $t('auth_logout') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="loggedOut">
      <v-col>
        <info-card
          class="mb-2"
          :title="$t('auth_logout_success_title')"
          :subtitle="$t('auth_logout_success_subtitle')"
        />
      </v-col>
    </v-row>
    <v-row v-if="loggedOut">
      <v-col align="center">
        <v-btn
          class="mt-3"
          color="secondary"
          @click="toHome"
        >
          {{ $t('dialog_to_home') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import InfoCard from '~/components/info/InfoCard.vue'

export default {
  name: 'UserLogout',
  components: { InfoCard },
  layout: 'default',

  data () {
    return {
      loggedOut: true
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_logout'))
    if (window.localStorage.getItem('logged-out') === 'true') {
      this.loggedOut = true
    } else {
      this.loggedOut = false
    }
  },

  beforeDestroy () {
    window.localStorage.setItem('logged-out', 'false')
  },
  methods: {
    async userLogout () {
      this.$auth.logout()
      window.localStorage.setItem('account-connected', 'false')
      window.localStorage.setItem('first-question', 'true')
      // window.localStorage.setItem('anonymous-questions', '')
      window.localStorage.setItem('thing-id', uuidv4())
      const idList = window.localStorage.getItem('thing-id-used')
      window.localStorage.setItem('thing-id-used', idList + window.localStorage.getItem('thing-id') + ',')
      await this.$localforage.cache.clear()
      await this.$localforage.storage.clear()
      this.$nuxt.$emit('update-user-status')
      this.loggedOut = true
      window.localStorage.setItem('logged-out', 'true')
      location.reload()
    },
    toHome () {
      window.$nuxt.$router.replace('/home')
      window.localStorage.setItem('logged-out', 'false')
    }
  }
}
</script>
