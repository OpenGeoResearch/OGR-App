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
    id="lazy-loading-questions"
    fluid
  >
    <v-row>
      <v-col>
        <v-banner
          dark
          class="mb-2"
          elevation="3"
          :icon="mdiMapSearch"
          color="secondary"
        >
          {{ $t('portal_banner') }}
        </v-banner>

        <v-card
          class="mx-auto mb-2"
          elevation="2"
          outlined
        >
          <v-card-title>
            <span>{{ $t('portal_info_title') }}</span>
          </v-card-title>
          <v-card-text class="font-weight-medium subtitle-1">
            {{ $t('portal_info_text') }}
          </v-card-text>
        </v-card>

        <v-card
          class="mx-auto"
          elevation="5"
          outlined
          color="external"
          :href="ogrMapUrl"
          target="_blank"
        >
          <v-card-title>
            <span>{{ $t('portal_link_title') }}</span>
            <v-spacer />
            <v-icon
              large
              right
            >
              {{ mdiOpenInNew }}
            </v-icon>
          </v-card-title>

          <v-card-text>
            {{ $t('portal_link_text') }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiMapSearch, mdiOpenInNew } from '@mdi/js'

export default {
  name: 'Portal',
  layout: 'default',

  data () {
    return {
      mdiMapSearch,
      mdiOpenInNew,
      ogrMapUrl: this.$config.ogrMapUrl
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_portal'))
  }
}
</script>
