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
    :value="active"
    persistent
    width="290"
  >
    <v-card color="highlight">
      <v-card-title class="headline">
        {{ title }}
      </v-card-title>
      <v-card-text>
        {{ firstInfo }}
      </v-card-text>
      <v-card-text>
        {{ secondInfo }}
      </v-card-text>
      <v-card-text align="center">
        <v-btn
          color="primary"
          x-small
          @click="$emit('click-check-button')"
        >
          {{ button }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'NewFeatureDialog',
  props: {
    title: {
      type: String,
      required: true,
      default: ''
    },
    firstInfo: {
      type: String,
      required: true,
      default: ''
    },
    secondInfo: {
      type: String,
      required: true,
      default: ''
    },
    button: {
      type: String,
      required: true,
      default: ''
    },
    active: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {

    }
  }
}
</script>
