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
  <v-alert
    :value="active"
    outlined
    dense
    color="info"
    text
    transition="scale-transition"
  >
    <v-card-text class="pa-0 mb-0" style="word-break: break-word;">
      Du befindest dich gerade in einem aktiven Serien-Event! (<span v-if="name" class="font-weight-bold">{{ name }}</span>)
    </v-card-text>

    <v-expand-transition class="mt-2">
      <div v-show="expand">
        <v-card-text class="pa-0 mb-0" style="word-break: break-word;">
          Solange du dich in einem Serien-Event befindest werden alle Fragen, die du stellst zu dieser Serie hinzugefügt. Du kannst das Serien-Event jeder Zeit verlassen, wenn du willst.
        </v-card-text>
        <v-card-actions class="pa-0 mb-0 mt-1">
          <v-spacer />
          <v-btn
            color="info"
            x-small
            @click="$emit('click-leave-series-event')"
          >
            Event verlassen
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </div>
    </v-expand-transition>

    <v-card-actions class="pa-0 mb-0 mr-0">
      <v-spacer />
      <v-btn
        v-ripple="false"
        x-small
        text
        color="info"
        @click="toggleSeriesAlert"
      >
        {{ expand ? $t('show_less') : $t('show_more') }}
        <v-icon>{{ expand ? mdiChevronUp : mdiChevronDown }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-alert>
</template>

<script>
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'

export default {
  name: 'InfoAlertActiveSeriesEvent',

  props: {
    active: {
      type: Boolean,
      required: true
    },
    tag: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      mdiChevronUp,
      mdiChevronDown,
      expand: false,
      series: undefined
    }
  },

  methods: {
    toggleSeriesAlert () {
      this.expand = !this.expand
    }
  }
}
</script>
