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
    <forum-input-dialog
      :active="input"
      :invalid="post.length > 250 || post.length === 0"
      :label="$t('action_submit').toString()"
      @click-dialog-close="closeForumInputDialog"
      @click-dialog-check="sendPost"
    >
      <v-textarea
        v-model="post"
        class="mt-1"
        :rules="[rules.length(250)]"
        counter="250"
        outlined
        autofocus
        no-resize
        :disabled="loading"
        :label="$t('forum_input_comment_label')"
        placeholder=""
        rows="4"
      />
    </forum-input-dialog>

    <v-card
      v-ripple="false"
      class="mb-2 mt-3"
      shaped
      :color="isExpert() ? 'highlight' : ''"
    >
      <v-card-text class="mb-0 pb-0">
        <span v-html="linkify(answerData.content)"></span>
      </v-card-text>
      <v-card-title class="mt-0 pt-0 mb-1 pb-0" align="end">
        <v-spacer />
        <v-chip class="mr-1" x-small>
          <v-icon left small>
            {{ mdiCalendar }}
          </v-icon>
          {{ answerData.created | dateParse('YYYY.MM.DD HH:mm') | dateFormat('DD.MM.YYYY - HH:mm') }}
        </v-chip>
        <v-chip x-small>
          <v-icon left small>
            {{ mdiAccount }}
          </v-icon>
          {{ answerData.user.username }}
        </v-chip>
        <forum-content-menu
          :id="answerData.id"
          report-type="answer"
          @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
          @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
        />
      </v-card-title>

      <v-list-item
        color="primary"
      >
        <v-list-item-subtitle>
          <v-row no-gutters>
            <info-chip-votes
              :id="answerData.id"
              post-type="POST_TYPE_ANSWER"
              :up="answerData.votes.upCount"
              :down="answerData.votes.downCount"
            />
            <v-spacer />
            <v-btn
              v-if="comments.length > 0"
              v-ripple="false"
              small
              plain
              :color="isExpert() ? 'neutral' : 'secondary'"
              @click="toggle"
            >
              {{ expand ? $t('hide_comments') : comments.length + ' ' + $t('show_comments') }}
              <v-icon>{{ expand ? mdiChevronUp : mdiChevronDown }}</v-icon>
            </v-btn>
            <v-btn
              v-else
              small
              plain
              color="neutral"
              :disabled="!(this.$auth.loggedIn && this.$nuxt.isOnline)"
              @click="openForumInputDialog"
            >
              {{ $t('forum_add_comment') }}
              <v-icon class="ml-1">
                {{ mdiChatPlus }}
              </v-icon>
            </v-btn>
          </v-row>
        </v-list-item-subtitle>
      </v-list-item>
      <v-expand-transition>
        <div v-show="expand" class="pb-1 pr-1">
          <v-row
            v-for="(comment, i) in comments"
            :key="i"
            no-gutters
          >
            <v-spacer />
            <forum-comment-card
              class="ma-1"
              :comment-data="comment"
              comment-type="answerComment"
            />
          </v-row>
          <v-row no-gutters>
            <v-spacer />
            <v-btn
              small
              plain
              color="neutral"
              :disabled="!(this.$auth.loggedIn && this.$nuxt.isOnline)"
              @click="openForumInputDialog"
            >
              {{ $t('forum_add_comment') }}
              <v-icon class="ml-1">
                {{ mdiChatPlus }}
              </v-icon>
            </v-btn>
          </v-row>
        </div>
      </v-expand-transition>
    </v-card>
  </div>
</template>

<script>
import { mdiCalendar, mdiAccount, mdiChevronUp, mdiChevronDown, mdiChatPlus } from '@mdi/js'
import InfoChipVotes from '~/components/info/InfoChipVotes'
import ForumInputDialog from '~/components/forum/ForumInputDialog'
import commentAnswer from '~/apollo/mutations/commentAnswer.gql'
import ForumCommentCard from '~/components/forum/ForumCommentCard'
import ForumContentMenu from '~/components/forum/ForumContentMenu'
import { linkify } from '@/util/ogr-utils'

export default {
  name: 'ForumAnswerWithComments',
  components: { ForumContentMenu, ForumCommentCard, ForumInputDialog, InfoChipVotes },
  props: {
    expert: {
      type: Boolean,
      required: false,
      default: false
    },
    answerData: {
      type: Object,
      required: true,
      default: () => { return {} }
    }
  },

  data () {
    return {
      ogrMapUrl: this.$config.ogrMapUrl,
      mdiCalendar,
      mdiAccount,
      mdiChevronUp,
      mdiChevronDown,
      mdiChatPlus,
      expand: false,
      input: false,
      post: '',
      rules: {
        length: len => v => (v || '').length <= len || this.$t('input_text_length', [len])
      },
      comments: [],
      loading: false
    }
  },

  mounted () {
    this.setComments(this.answerData.comments)
  },

  methods: {
    linkify (inputText) {
      return linkify(inputText, this.ogrMapUrl)
    },
    openForumInputDialog () {
      this.input = true
      this.$emit('forum-input-dialog-opened')
    },
    closeForumInputDialog () {
      this.input = false
      this.$emit('forum-input-dialog-closed')
    },
    isExpert () {
      let isExpert = false
      for (const role of this.answerData.user.roles) {
        if (role.name === 'ROLE_EXPERT') {
          isExpert = true
        }
      }
      return isExpert
    },
    toggle () {
      this.expand = this.expand !== true
    },
    setComments (comments) {
      this.comments = comments.sort(function (a, b) {
        return a.id - b.id
      })
    },
    sendPost () {
      if (this.$auth.loggedIn && this.$nuxt.isOnline) {
        if (this.post.length <= 250 || this.post.length > 0) {
          this.loading = true
          this.$nuxt.$emit('loading-start')
          this.$apollo.mutate({
            mutation: commentAnswer,
            variables: {
              id: this.answerData.id,
              content: this.post
            },
            context: {
              headers: {
                Authorization: this.$auth.getToken('local')
              }
            }
          }).then((response) => {
            this.setComments(response.data.commentAnswer.comments)
            this.post = ''
            this.$nuxt.$emit('loading-status', { status: true, message: this.$t('loading_success_messsage_standard') })
            this.loading = false
            this.closeForumInputDialog()
            this.expand = true
          }).catch(() => {
            this.$nuxt.$emit('loading-status', { status: false, message: this.$t('loading_error_messsage_standard') })
            this.loading = false
            this.closeForumInputDialog()
          })
        }
      }
    }
  }
}
</script>

<style>

</style>
