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
    color="secondary"
    dark
    width="100%"
  >
    <v-list-item two-line>
      <v-list-item-action style="margin-right: 10px">
        <v-icon
          large
        >
          {{ mdiTwitter }}
        </v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title class="text-h6 font-weight-light">
          {{ $t('home_news_title') }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-body font-weight-light">
          {{ $t('home_news_subtitle') }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-card-text class="pb-0 pt-0">
      {{ news.created ? news.created : '' | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY') }}
    </v-card-text>
    <v-card-text class="text-h7 font-weight-bold pb-0 pt-0">
      <v-skeleton-loader
        v-if="news.text === ''"
        type="text, text, text, text, text"
      />
      <span v-else>{{ news.text }}</span>
    </v-card-text>
    <v-card-actions class="text--center">
      <v-spacer />
      <v-btn
        icon
        :disabled="news.id <= 1"
        @click="$emit('click-news-left', news.id)"
      >
        <v-icon>
          {{ mdiChevronLeft }}
        </v-icon>
      </v-btn>
      <v-btn
        icon
        :disabled="news.id >= newest"
        @click="$emit('click-news-right', news.id)"
      >
        <v-icon>
          {{ mdiChevronRight }}
        </v-icon>
      </v-btn>
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script>
import { mdiTwitter, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

export default {
  name: 'HomeNews',

  props: {
    news: {
      type: Object,
      required: true,
      default: () => { return {} }
    },
    newest: {
      type: Number,
      required: true,
      default: 1
    }
  },

  data () {
    return {
      mdiTwitter,
      mdiChevronLeft,
      mdiChevronRight
    }
  }
}
</script>
