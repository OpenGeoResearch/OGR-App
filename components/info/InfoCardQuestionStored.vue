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
  <div>
    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('upload_delete_title') }}
        </v-card-title>
        <v-card-subtitle>
          {{ $t('upload_delete_subtitle') }}
        </v-card-subtitle>
        <v-card-text class="font-italic font-weight-black">
          "{{ name }}"
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            {{ $t('action_no') }}
          </v-btn>

          <v-btn
            color="primary"
            text
            @click="deleteQuestion"
          >
            {{ $t('action_yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card
      class="mb-2"
    >
      <v-list-item
        two-line
      >
        <v-list-item-avatar
          tile
          size="80"
          color="grey"
        >
          <v-img v-if="thumbnail !== 'undefined'" :src="thumbnail" />
          <v-img v-else src="/ogr_placeholder_2.png" />
        </v-list-item-avatar>
        <v-list-item-content class="mx-0">
          <v-list-item-title class="title" style="word-break: break-word;">
            {{ name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <v-icon left small>
              {{ mdiCalendar }}
            </v-icon>
            {{ datetime | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY - HH:mm') }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <v-icon left small>
              {{ mdiMapMarker }}
            </v-icon>
            Lat: {{ coords[0].toFixed(5) }}, Lon: {{ coords[1].toFixed(5) }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <v-icon left small>
              {{ mdiViewList }}
            </v-icon>
            {{ categoryName === null ? categoryName : '---' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-card-actions>
        <v-spacer />
        <v-btn
          tile
          color="accent"
          x-small
          @click="dialog = true"
        >
          <v-icon left>
            {{ mdiClose }}
          </v-icon>
          {{ $t('upload_card_delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { mdiCalendar, mdiMapMarker, mdiViewList, mdiClose } from '@mdi/js'

export default {
  name: 'InfoCardQuestionStored',

  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      default: ''
    },
    description: {
      type: String,
      required: true,
      default: ''
    },
    datetime: {
      type: String,
      required: true,
      default: ''
    },
    category: {
      type: Object,
      required: true,
      default: () => { return {} }
    },
    coords: {
      type: Array,
      required: true,
      default: () => { return [] }
    },
    thumbnail: {
      type: String,
      required: false,
      default: 'undefined'
    }
  },

  data () {
    return {
      mdiCalendar,
      mdiMapMarker,
      mdiViewList,
      mdiClose,
      dialog: false,
      categoryName: ''
    }
  },
  created () {
    if (this.category) {
      this.categoryName = this.category.name
    } else {
      this.categoryName = '---'
    }
  },

  methods: {
    async deleteQuestion () {
      this.dialog = false
      await this.$localforage.storage.removeItem(this.id)
      this.$nuxt.$emit('update-stored-questions')
    }
  }
}
</script>
