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
    <v-list-item-action>
      <v-icon
        :color="color"
      >
        {{ icon }}
      </v-icon>
    </v-list-item-action>
    <v-list-item-content @click="$emit('click-list-open')">
      <v-list-item-title>{{ title }}</v-list-item-title>
      <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>
      <v-list-item-subtitle v-if="hint !== 'Hint'">
        ({{ hint }})
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>

export default {
  name: 'InputList',

  props: {
    title: {
      type: String,
      required: false,
      default: 'Title'
    },
    subtitle: {
      type: String,
      required: false,
      default: 'Subtitle'
    },
    hint: {
      type: String,
      required: false,
      default: 'Hint'
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: false,
      default: 'secondary'
    }
  },

  data () {
    return {}
  }
}
</script>
