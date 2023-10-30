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
    <v-row align="center">
      <v-col justify="center">
        <v-divider />
        <v-select
          v-model="selected"
          :items="options"
          item-text="label"
          item-value="id"
          outlined
          label="Was willst du reparieren?"
        />

        <v-card v-if="selected === undefined">
          <v-card-title>
            <v-icon>
              {{ mdiTools }}
            </v-icon>
            <span class="ml-2">Reparaturoptionen</span>
          </v-card-title>
          <v-card-text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.</v-card-text>
          <v-card-text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.</v-card-text>
        </v-card>

        <v-card v-if="selected === 'geolocation'">
          <v-card-title>
            <v-icon>
              {{ mdiMapMarkerAlert }}
            </v-icon>
            <span class="ml-2">Standortdienste</span>
          </v-card-title>
          <v-card-text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              :href="ogrPwaUrl + '/geolocation'"
              target="_blank"
            >
              Reaktivieren
            </v-btn>
            <v-spacer />
          </v-card-actions>
          <v-card-text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiMapMarkerAlert, mdiTools } from '@mdi/js'

export default {
  name: 'Repair',
  layout: 'default',

  data () {
    return {
      ogrPwaUrl: this.$config.ogrPwaUrl,
      mdiMapMarkerAlert,
      mdiTools,
      selected: undefined,
      options: [{
        id: 'geolocation',
        label: 'Standortdienste'
      }]
    }
  },

  beforeMount () {
    this.$nuxt.$emit('set-app-title', this.$t('page_title_repair'))
  }
}
</script>

<style scoped>
::v-deep .v-select__selections {
  text-transform: none;
}
</style>
