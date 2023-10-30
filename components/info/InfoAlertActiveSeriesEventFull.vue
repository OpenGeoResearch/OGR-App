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
  >
    <v-card-text class="pa-0 mb-0" style="word-break: break-word;">
      {{ $t('series_active_info_text') }}
    </v-card-text>
    <v-card-text v-if="seriesData.name" class="pa-0 ma-0" style="word-break: break-word;">
      <span>{{ $t('series_name') }}</span>
      <span class="font-weight-bold">{{ seriesData.name }}</span>
    </v-card-text>
    <v-card-text v-if="seriesData.end && checkSeriesStatus" class="pa-0 ma-0" style="word-break: break-word;">
      <span>{{ $t('series_status') }}</span>
      <span class="font-weight-bold">{{ $t('series_status_open') }} ({{ $t('series_status_until') }} {{ seriesData.end | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY') }})</span>
    </v-card-text>
    <v-card-text v-else class="pa-0 ma-0" style="word-break: break-word;">
      <span>{{ $t('series_status') }}</span>
      <span class="font-weight-bold">{{ $t('series_status_closed') }}</span>
    </v-card-text>

    <v-card-actions class="pa-0 ma-0 mt-2">
      <v-btn
        color="info"
        small
        @click="$emit('click-leave-series-event')"
      >
        {{ $t('series_leave') }}
      </v-btn>
      <v-btn
        v-if="seriesData"
        small
        @click="goToSeries(seriesData.id)"
      >
        {{ $t('series_go_to') }}
      </v-btn>
    </v-card-actions>
  </v-alert>
</template>

<script>
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'

export default {
  name: 'InfoAlertActiveSeriesEventFull',

  props: {
    active: {
      type: Boolean,
      required: true
    },
    tag: {
      type: String,
      required: true
    },
    seriesData: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      mdiChevronUp,
      mdiChevronDown,
      expand: false
    }
  },

  methods: {
    goToSeries (id) {
      this.$nuxt.$router.push('/series/' + id)
    },
    checkSeriesStatus () {
      return Date.now() < Date.parse(this.seriesData.end)
    }
  }
}
</script>
