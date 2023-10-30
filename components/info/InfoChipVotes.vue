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
  <v-menu
    v-model="menu"
    transition="slide-x-transition"
    :close-on-content-click="true"
    offset-x
    rounded="b-xl t-xl"
  >
    <template #activator="{ on, attrs }">
      <v-chip
        class="mr-1"
        outlined
        dark
        color="neutral"
        text-color="white"
        v-bind="attrs"
        v-on="on"
      >
        <v-avatar left>
          <v-icon color="neutral">
            {{ mdiThumbsUpDown }}
          </v-icon>
        </v-avatar>
        <span :class="votes.sum < 0 ? 'negative--text' : 'positive--text'">{{ votes.sum < 0 ? ' ' + votes.sum : ' +' + (votes.sum) }}</span>
      </v-chip>
    </template>

    <v-card>
      <v-row no-gutters justify="center">
        <v-btn
          color="positive"
          icon
          :disabled="!this.$auth.loggedIn"
          @click="vote( 'VOTE_UP')"
        >
          <v-icon>{{ mdiChevronUp }}</v-icon>
          {{ votes.up }}
        </v-btn>
      </v-row>
      <v-row no-gutters justify="center">
        <v-btn
          color="negative"
          icon
          :disabled="!this.$auth.loggedIn"
          @click="vote( 'VOTE_DOWN')"
        >
          <v-icon>{{ mdiChevronDown }}</v-icon>
          {{ votes.down }}
        </v-btn>
      </v-row>
    </v-card>
  </v-menu>
</template>

<script>
import { mdiChevronUp, mdiChevronDown, mdiThumbsUpDown } from '@mdi/js'
import questionVote from '~/apollo/mutations/questionVote.gql'
import answerVote from '~/apollo/mutations/answerVote.gql'

export default {
  name: 'InfoChipVotes',
  props: {
    // eslint-disable-next-line vue/require-prop-types
    id: {
      required: true,
      default: null
    },
    postType: {
      type: String,
      required: true,
      default: ''
    },
    up: {
      type: Number,
      required: true,
      default: null
    },
    down: {
      type: Number,
      required: true,
      default: null
    }
  },

  data () {
    return {
      mdiChevronUp,
      mdiChevronDown,
      mdiThumbsUpDown,
      votes: {
        sum: 0,
        up: 0,
        down: 0
      },
      menu: false
    }
  },

  mounted () {
    this.votes.up = this.up
    this.votes.down = this.down
    this.calculateVotes()
  },

  methods: {
    calculateVotes () {
      this.votes.sum = this.votes.up - this.votes.down
    },
    vote (direction) {
      if (this.$auth.loggedIn && this.$nuxt.isOnline) {
        if (this.postType === 'POST_TYPE_QUESTION') {
          this.$apollo.mutate({
            mutation: questionVote,
            variables: {
              id: this.id,
              voteDirection: direction
            },
            context: {
              headers: {
                Authorization: this.$auth.getToken('local')
              }
            }
          }).then((response) => {
            this.votes.up = response.data.questionVote.votes.upCount
            this.votes.down = response.data.questionVote.votes.downCount
            this.calculateVotes()
          })
        } else if (this.postType === 'POST_TYPE_ANSWER') {
          this.$apollo.mutate({
            mutation: answerVote,
            variables: {
              id: this.id,
              voteDirection: direction
            },
            context: {
              headers: {
                Authorization: this.$auth.getToken('local')
              }
            }
          }).then((response) => {
            this.votes.up = response.data.answerVote.votes.upCount
            this.votes.down = response.data.answerVote.votes.downCount
            this.calculateVotes()
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.v-chip.v-chip--outlined.v-chip.v-chip {
  background-color: white !important;
}
</style>
