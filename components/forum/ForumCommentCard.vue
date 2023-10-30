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
    v-ripple="false"
    class="mb-2 ml-10 pt-0 pb-0"
    shaped
  >
    <v-card-text class="mb-0 pb-0">
      {{ linkify(commentData.content) }}
    </v-card-text>
    <v-card-title class="mt-0 pt-0 pb-0 mb-1" align="end">
      <v-spacer />
      <v-chip class="mr-1" x-small>
        <v-icon left small>
          {{ mdiCalendar }}
        </v-icon>
        {{ commentData.created | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY - HH:mm') }}
      </v-chip>
      <v-chip x-small>
        <v-icon left small>
          {{ mdiAccount }}
        </v-icon>
        {{ commentData.user.username }}
      </v-chip>
      <forum-content-menu
        :id="commentData.id"
        :report-type="commentType"
        @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
        @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
      />
    </v-card-title>
  </v-card>
</template>

<script>
import { mdiCalendar, mdiAccount } from '@mdi/js'
import ForumContentMenu from '~/components/forum/ForumContentMenu'
import { linkify } from '@/util/ogr-utils'

export default {
  name: 'ForumCommentCard',
  components: { ForumContentMenu },
  props: {
    commentData: {
      type: Object,
      required: true,
      default: () => { return {} }
    },
    commentType: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      ogrMapUrl: this.$config.ogrMapUrl,
      mdiCalendar,
      mdiAccount
    }
  },

  methods: {
    linkify (inputText) {
      return linkify(inputText, this.ogrMapUrl)
    }
  }
}
</script>

<style>

</style>
