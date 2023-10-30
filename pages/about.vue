<!--
    Copyright (C) 2023 Geodätisches Institut RWTH Aachen University
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
    <v-row align="center">
      <v-col justify="center">
        <v-divider />

        <v-list-item two-line :href="'mailto:' + ogrSupportMail + '?subject=Support: OpenGeoResearch - App'">
          <v-list-item-content>
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('about_contact_support') }}</v-list-item-title>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>

        <v-divider />

        <v-list-item two-line target="_blank" :href="ogrWebUrl + '/datenschutz'">
          <v-list-item-content>
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('about_privacy_policy') }}</v-list-item-title>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>

        <v-divider />

        <v-list-item two-line target="_blank" :href="ogrWebUrl + '/nutzungsbedingungen'">
          <v-list-item-content>
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title>{{ $t('about_terms_of_use') }}</v-list-item-title>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>

        <v-divider />

        <v-list-item two-line>
          <v-list-item-content>
            <v-row no-gutters align="center">
              <v-col no-gutters>
                <v-list-item-title><span class="secondary--text">{{ $t('about_version') }}</span><span>{{ ogrPwaVersion }}</span></v-list-item-title>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'About',
  layout: 'default',

  data () {
    return {
      ogrWebUrl: this.$config.ogrWebUrl,
      ogrSupportMail: this.$config.ogrSupportMail,
      ogrPwaVersion: this.$config.ogrPwaVersion
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_series'))
  }
}
</script>
