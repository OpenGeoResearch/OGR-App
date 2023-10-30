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
  <v-row>
    <v-col>
      <v-card
        class="mx-auto mb-2"
        style="display: flex !important; flex-direction: column;"
        elevation="2"
        outlined
        height="80vh"
      >
        <v-card-title>
          {{ $t('safety_info_title') }}
        </v-card-title>
        <v-card-subtitle>
          {{ $t('safety_info_subtitle') }}
        </v-card-subtitle>
        <v-card-text
          class="font-weight-medium subtitle-1"
          style="flex-grow: 1; overflow: auto;"
        >
          <b>{{ $t('safety_info_1') }}</b><br></br>
          {{ $t('safety_info_2') }}<br>
          <b>{{ $t('safety_info_3') }}</b><br></br>
          {{ $t('safety_info_4') }}<br>
          <ol>
            <li><b>{{ $t('safety_rule_1a') }}</b><br>{{ $t('safety_rule_1b') }}</li>
            <li><b>{{ $t('safety_rule_2a') }}</b><br>{{ $t('safety_rule_2b') }}</li>
            <li><b>{{ $t('safety_rule_3a') }}</b><br>{{ $t('safety_rule_3b') }}</li>
          </ol>
          <br>
          {{ $t('safety_info_5') }}<br>{{ $t('safety_info_6') }}<br>
          {{ $t('safety_info_7') }}
        </v-card-text>
        <v-btn
          color="secondary"
          :disabled="disabled"
          :loading="loading"
          @click="$emit('click-to-question')"
        >
          {{ $t('action_understood') }}
        </v-btn>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

export default {
  name: 'InfoQuestionUnderSixteen',

  data () {
    return {
      loader: null,
      loading: true,
      disabled: true
    }
  },

  watch: {
    loader () {
      this.loading = true
      setTimeout(() => (this.waiting()), 60000)
      this.loader = null
    }
  },

  created () {
    this.loader = 'loading'
  },

  methods: {
    waiting () {
      if (this.loading) {
        this.disabled = false
        this.loading = false
      }
    }
  }
}
</script>
