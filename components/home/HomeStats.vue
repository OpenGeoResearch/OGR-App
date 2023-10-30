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
  <v-card
    class="mx-auto"
    elevation="1"
    outlined
  >
    <v-card-title>
      <v-icon
        large
        left
      >
        {{ mdiChartLine }}
      </v-icon>
      <span class="text-h6 font-weight-light">{{ $t('home_stats_title') }}</span>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col>
          <v-alert
            class="pa-0"
            rounded
            outlined
            color="secondary"
            elevation="1"
            @click="toFind"
          >
            <v-row no-gutters class="ml-2">
              <v-col class="text-start text--secondary">
                {{ $t('home_stats_new_top') }}
              </v-col>
            </v-row>
            <v-row no-gutters class="ml-3">
              <v-col class="text-start text-h5 text--primary">
                {{ countQuestionsNew }}
              </v-col>
            </v-row>
            <v-row no-gutters class="ml-2">
              <v-col class="text-start text--secondary">
                {{ $t('home_stats_new_bottom') }}
              </v-col>
            </v-row>
          </v-alert>
        </v-col>
        <v-col>
          <v-alert
            class="pa-0"
            rounded
            outlined
            color="secondary"
            elevation="1"
            @click="toExplore"
          >
            <v-row no-gutters class="ml-2">
              <v-col class="text-start text--secondary">
                {{ $t('home_stats_all_top') }}
              </v-col>
            </v-row>
            <v-row no-gutters class="ml-3">
              <v-col class="text-start text-h5 text--primary">
                {{ countQuestionsAll }}
              </v-col>
            </v-row>
            <v-row no-gutters class="ml-2">
              <v-col class="text-start text--secondary">
                {{ $t('home_stats_all_bottom') }}
              </v-col>
            </v-row>
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import { mdiChartLine } from '@mdi/js'

export default {
  name: 'HomeStats',

  props: {
    countQuestionsAll: {
      type: String,
      required: true,
      default: '-'
    },
    countQuestionsNew: {
      type: String,
      required: true,
      default: '-'
    }
  },

  data () {
    return {
      mdiChartLine,
      ogrMapUrl: this.$config.ogrMapUrl
    }
  },

  methods: {
    toFind () {
      window.$nuxt.$router.replace('/find')
    },
    toExplore () {
      window.$nuxt.$router.replace('/explore')
    }
  }
}
</script>
