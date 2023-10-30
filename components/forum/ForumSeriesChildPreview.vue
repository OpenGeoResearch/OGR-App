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
    v-if="question"
    v-ripple="false"
    class="mb-2"
  >
    <forum-dialog :active="forum" @click-dialog-close="closeForumDialog">
      <forum-content
        :question="question.datastream.name"
        :description="question.datastream.description"
        :category="classification(question.datastream.category)"
        :images="question.datastream.images"
        :question-id="question.id"
        @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
        @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
      />
    </forum-dialog>

    <forum-dialog :active="map" @click-dialog-close="closeMapDialog">
      <info-map :coords="question.datastream.observedArea.coordinates" marker="/marker_info.png" />
    </forum-dialog>

    <v-list-item>
      <v-list-item-avatar
        tile
        size="80"
        color="placeholder"
      >
        <v-img v-if="question.datastream.images.length > 0" :src="preview(question.datastream.images[0])" @click="showMediaDisplay(0)" />
        <v-img v-else src="/ogr_placeholder_2.png" />
      </v-list-item-avatar>
      <v-list-item-content class="mx-0" @click="toggle">
        <v-list-item-title class="title" style="word-break: break-word;">
          {{ question.datastream.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiCalendar }}
          </v-icon>
          {{ question.datastream.resultTime | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY - HH:mm') }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiMapMarker }}
          </v-icon>
          Lat: {{ question.datastream.observedArea.coordinates[0].toFixed(5) }}, Lon: {{ question.datastream.observedArea.coordinates[1].toFixed(5) }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <v-icon left small>
            {{ mdiViewList }}
          </v-icon>
          {{ classification(question.datastream.category) }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider v-show="show" />

    <v-expand-transition>
      <div v-show="show">
        <v-list-item class="mt-0 mb-0 pt-0 pb-0">
          <v-spacer />
          <v-btn
            v-if="question.id"
            class="mr-2"
            color="secondary"
            @click="openMapDialog"
          >
            <v-icon>
              {{ mdiMap }}
            </v-icon>
          </v-btn>
          <v-btn
            v-if="question.id"
            color="external"
            :href="ogrMapUrl + '/question/' + question.id"
            target="_blank"
          >
            <v-icon>
              {{ mdiOpenInNew }}
            </v-icon>
          </v-btn>
        </v-list-item>

        <div @click="toggle">
          <v-card-title class="pt-0 mb-0 pb-0" style="word-break: break-word;">
            <span>{{ question.datastream.name }}</span>
          </v-card-title>
          <v-card-text class="pt-0 mb-1 pb-0" style="word-break: break-word;">
            {{ question.datastream.description }}
          </v-card-text>
        </div>

        <v-card-text class="mt-0 pt-0">
          <v-slide-group
            show-arrows
          >
            <v-slide-item
              v-for="(image, j) in question.datastream.images"
              :key="j"
              class="mt-1 mb-1 mr-1"
            >
              <v-avatar
                tile
                size="80"
                color="placeholder"
              >
                <v-img
                  :src="preview(image)"
                  style="width: 80px; float: left; max-width: 80px; text-align: end;"
                  aspect-ratio="1"
                  @click="showMediaDisplay(j)"
                />
              </v-avatar>
            </v-slide-item>
          </v-slide-group>
        </v-card-text>
      </div>
    </v-expand-transition>

    <v-divider />

    <v-list-item>
      <info-chip-votes
        :id="question.id"
        post-type="POST_TYPE_QUESTION"
        :up="question.votes.upCount"
        :down="question.votes.downCount"
      />
      <v-spacer />

      <info-chip-number
        class="mr-1"
        :icon="mdiSchool"
        :value="expertAnswers"
        :primary="'primary'"
        :secondary="'secondary'"
        @click="openForumDialog"
      />
      <info-chip-number
        :icon="mdiAccountGroup"
        :value="communityAnswers"
        :primary="'primary'"
        :secondary="'secondary'"
        @click="openForumDialog"
      />
    </v-list-item>

    <v-dialog
      v-model="active"
    >
      <v-img
        :src="source"
        style="width: 100%; float: left; text-align: end;"
        aspect-ratio="1"
      >
        <v-btn
          icon
          dark
          large
          @click="active = false"
        >
          <v-icon>
            {{ mdiClose }}
          </v-icon>
        </v-btn>
      </v-img>
    </v-dialog>
  </v-card>
</template>

<script>
import { mdiCalendar, mdiMapMarker, mdiViewList, mdiOpenInNew, mdiChevronUp, mdiChevronDown, mdiAccountGroup, mdiSchool, mdiThumbsUpDown, mdiClose, mdiMap, mdiMapMarkerMultiple } from '@mdi/js'
import { mapState } from 'vuex'
import { getCategoryFromCode } from '@/util/ogr-utils'
import ForumDialog from '~/components/forum/ForumDialog'
import InfoChipNumber from '~/components/info/InfoChipNumber'
import ForumContent from '~/components/forum/ForumContent'
import InfoChipVotes from '~/components/info/InfoChipVotes'
import InfoMap from '~/components/info/InfoMap'

export default {
  name: 'ForumSeriesChildPreview',
  components: { InfoMap, InfoChipVotes, ForumContent, InfoChipNumber, ForumDialog },
  props: {
    question: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      mdiCalendar,
      mdiMapMarker,
      mdiViewList,
      mdiOpenInNew,
      mdiChevronUp,
      mdiChevronDown,
      mdiAccountGroup,
      mdiSchool,
      mdiThumbsUpDown,
      mdiClose,
      mdiMap,
      mdiMapMarkerMultiple,
      show: false,
      active: false,
      source: undefined,
      forum: false,
      map: false,
      ogrMapUrl: this.$config.ogrMapUrl,
      ogrApiUrl: this.$config.ogrApiUrl,
      expertAnswers: 0,
      communityAnswers: 0
    }
  },

  computed: {
    ...mapState('ogr', ['selectedSeries'])
  },

  created () {
    this.$nuxt.$on('close-question-expanse', () => {
      this.show = false
    })
  },

  mounted () {
    this.countAnswers()
  },

  beforeDestroy () {
    this.$nuxt.$off('close-question-expanse')
  },

  methods: {
    toggle () {
      if (this.show === true) {
        this.show = false
      } else {
        this.$nuxt.$emit('close-question-expanse')
        this.show = true
      }
    },
    openForumDialog () {
      this.forum = true
      this.$emit('forum-dialog-opened')
    },
    openMapDialog () {
      this.map = true
      this.$emit('forum-dialog-opened')
    },
    closeForumDialog () {
      this.forum = false
      this.$emit('forum-dialog-closed')
    },
    closeMapDialog () {
      this.map = false
      this.$emit('forum-dialog-closed')
    },
    classification (category) {
      return getCategoryFromCode(category, this.$i18n.locale)
    },
    showMediaDisplay (j) {
      this.source = this.medium(this.question.datastream.images[j])
      this.active = true
    },
    preview (url) {
      return url + '?size=preview'
    },
    medium (url) {
      return url + '?size=medium'
    },
    countAnswers () {
      let expertAnswers = 0
      let communityAnswers = 0

      for (const answer of this.question.answers) {
        let isExpert = false
        for (const role of answer.user.roles) {
          if (role.name === 'ROLE_EXPERT') {
            isExpert = true
          }
        }

        if (isExpert) {
          expertAnswers += 1
        } else {
          communityAnswers += 1
        }
      }

      this.expertAnswers = expertAnswers
      this.communityAnswers = communityAnswers
    }
  }
}
</script>

<style scoped>
.disable-events {
  pointer-events: none
}
.cut-text
{
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
