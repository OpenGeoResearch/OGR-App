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
  <v-list-item two-line>
    <v-list-item-content @click="$emit('click-dialog-open')">
      <v-list-item-subtitle>Lat: {{ lat }}, Long: {{ lon }}</v-list-item-subtitle>
      <v-list-item-subtitle v-if="!manual">{{ $t('input_location_accuracy') }}: {{ accuracy }} m</v-list-item-subtitle>
      <v-list-item-subtitle v-else><span class="accent--text">{{ $t('geo_location_hint') }}</span></v-list-item-subtitle>
      <v-list-item-subtitle v-if="!manual"><span class="info--text">{{ $t('input_location_manual') }}</span></v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn
        icon
        :disabled="manual"
        @click="$emit('click-center-map')"
      >
        <v-icon>
          {{ mdiCrosshairsGps }}
        </v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { mdiCrosshairsGps } from '@mdi/js'

export default {
  name: 'MapList',

  props: {
    lat: {
      type: String,
      required: false,
      default: '---'
    },
    lon: {
      type: String,
      required: false,
      default: '---'
    },
    accuracy: {
      type: String,
      required: false,
      default: '---'
    },
    manual: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      mdiCrosshairsGps
    }
  }
}
</script>
