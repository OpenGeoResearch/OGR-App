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
      class="mb-2 mt-1"
      outlined
    >
      <v-card-text class="mb-0 pb-1">
        <v-img v-if="images.length > 0" :src="medium(images[0])" lazy-src="/ogr_placeholder_2.png" @click="showMediaDisplay(0)" />
        <v-img v-else src="/ogr_placeholder_2.png" />
      </v-card-text>
      <v-card-title class="pt-0 mt-0 pb-0 mb-0" style="word-break: break-word;">
        <v-chip
          class="mt-1 pb-0 mb-0"
          label
          small
          color="highlight"
        >
          {{ category }}
        </v-chip>
        <v-spacer />
        <v-icon
          v-if="$auth.loggedIn && $nuxt.isOnline"
          :color="bookmarked ? 'primary' : 'neutral'"
          large
          @click="bookmark(!bookmarked)"
        >
          {{ bookmarked ? mdiBookmarkCheck : mdiBookmark }}
        </v-icon>
        <forum-content-menu
          :id="id"
          report-type="question"
          @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
          @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
        />
      </v-card-title>
      <v-card-title class="pt-0 mt-0" style="word-break: break-word;">
        {{ question }}
      </v-card-title>

      <v-expand-transition>
        <div v-show="show">
          <div>
            <forum-series-info
              v-if="isSeriesParent || isSeriesChild"
              class="mr-3 ml-3"
              :series-tag="seriesTag"
              :series-type="isSeriesParent ? 'SERIES_PARENT' : 'SERIES_CHILD'"
              @click-show-series="$emit('click-show-series')"
            />
            <v-card-text class="pt-0 mb-0 pb-0" style="word-break: break-word;">
              {{ description }}
            </v-card-text>
            <v-card-text class="pt-0 mb-2 pb-0" style="word-break: break-word;">
              <div class="text-left">
                <template v-for="(tag) in semanticTags">
                  <v-chip
                    :key="tag.result"
                    class="mt-1 mr-2"
                    :color="isSeriesTag(tag) ? 'info' : 'primary'"
                    outlined
                    pill
                    small
                  >
                    {{ tag.result }}
                  </v-chip>
                </template>
              </div>
            </v-card-text>
          </div>
          <v-card-text class="mt-0 pt-0">
            <v-slide-group
              show-arrows
            >
              <v-slide-item
                v-for="(image, j) in images"
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

      <v-card-actions class="mt-0 pt-0">
        <v-spacer />
        <v-btn
          v-ripple="false"
          small
          text
          color="primary"
          @click="toggleQuestions"
        >
          {{ show ? $t('show_less') : $t('show_more') }}
          <v-icon>{{ show ? mdiChevronUp : mdiChevronDown }}</v-icon>
        </v-btn>
        <v-spacer />
      </v-card-actions>

      <v-divider />

      <v-list-item
        color="primary"
      >
        <v-list-item-subtitle>
          <v-row no-gutters>
            <info-chip-votes
              :id="id"
              post-type="POST_TYPE_QUESTION"
              :up="votes.upCount"
              :down="votes.downCount"
            />
            <v-spacer />
            <v-btn
              v-if="comments.length > 0"
              v-ripple="false"
              small
              plain
              color="secondary"
              @click="toggleComments"
            >
              {{ expand ? $t('hide_comments') : comments.length + ' ' + $t('show_comments') }}
              <v-icon>{{ expand ? mdiChevronUp : mdiChevronDown }}</v-icon>
            </v-btn>
            <v-btn
              v-else
              small
              plain
              color="neutral"
              :disabled="!($auth.loggedIn && $nuxt.isOnline)"
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
              comment-type="questionComment"
            />
          </v-row>
          <v-row no-gutters>
            <v-spacer />
            <v-btn
              small
              plain
              color="neutral"
              :disabled="!($auth.loggedIn && $nuxt.isOnline)"
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
  </div>
</template>

<script>
import { mdiCalendar, mdiAccount, mdiChevronUp, mdiChevronDown, mdiClose, mdiChatPlus, mdiBookmark, mdiBookmarkCheck, mdiDotsVertical } from '@mdi/js'
import ForumCommentCard from '~/components/forum/ForumCommentCard'
import InfoChipVotes from '~/components/info/InfoChipVotes'
import ForumInputDialog from '~/components/forum/ForumInputDialog'
import commentQuestion from '@/apollo/mutations/commentQuestion.gql'
import isQuestionBookmarked from '@/apollo/queries/isQuestionBookmarked.gql'
import questionBookmark from '@/apollo/mutations/questionBookmark.gql'
import ForumContentMenu from '~/components/forum/ForumContentMenu'
import ForumSeriesInfo from '~/components/forum/ForumSeriesInfo'

export default {
  name: 'ForumQuestionWithComments',
  components: { ForumSeriesInfo, ForumContentMenu, ForumInputDialog, InfoChipVotes, ForumCommentCard },
  props: {
    // eslint-disable-next-line vue/require-prop-types
    id: {
      required: true,
      default: null
    },
    question: {
      type: String,
      required: false,
      default: ''
    },
    description: {
      type: String,
      required: false,
      default: ''
    },
    category: {
      type: String,
      required: true,
      default: ''
    },
    images: {
      type: Array,
      required: true,
      default: () => { return [] }
    },
    votes: {
      type: Object,
      required: true,
      default: () => { return {} }
    },
    commentData: {
      type: Array,
      required: true,
      default: () => { return [] }
    }
  },

  data () {
    return {
      mdiCalendar,
      mdiAccount,
      mdiChevronUp,
      mdiChevronDown,
      mdiClose,
      mdiChatPlus,
      mdiBookmark,
      mdiBookmarkCheck,
      mdiDotsVertical,
      expand: false,
      show: false,
      active: false,
      source: undefined,
      input: false,
      post: '',
      rules: {
        length: len => v => (v || '').length <= len || this.$t('input_text_length', [len])
      },
      comments: [],
      loading: false,
      bookmarked: false,
      ogrStaUrl: this.$config.ogrStaUrl,
      semanticTags: [],
      functionalTags: [],
      isSeriesParent: false,
      isSeriesChild: false
    }
  },

  computed: {
    seriesTag () {
      for (let i = 0; i < this.semanticTags.length; i++) {
        if (this.semanticTags[i].result.substring(0, 2) === 's_') {
          return this.semanticTags[i].result
        }
      }
      return ''
    }
  },

  mounted () {
    this.setComments(this.commentData)
    this.isBookmarked()
    this.getTags()
  },

  methods: {
    isSeriesTag (tag) {
      return tag.result.substring(0, 2) === 's_'
    },
    isBookmarked () {
      if (this.$auth.loggedIn && this.$nuxt.isOnline) {
        this.$apollo.query({
          query: isQuestionBookmarked,
          variables: {
            id: this.id
          },
          fetchPolicy: 'no-cache',
          context: {
            headers: {
              Authorization: this.$auth.getToken('local')
            }
          }
        }).then((response) => {
          this.bookmarked = response.data.isQuestionBookmarked
        })
      }
    },
    bookmark (val) {
      this.bookmarked = val
      if (this.$auth.loggedIn && this.$nuxt.isOnline) {
        this.$apollo.mutate({
          mutation: questionBookmark,
          variables: {
            id: this.id,
            bookmark: val
          },
          fetchPolicy: 'no-cache',
          context: {
            headers: {
              Authorization: this.$auth.getToken('local')
            }
          }
        }).then((response) => {
          this.bookmarked = response.data.questionBookmark
        })
      }
    },
    openForumInputDialog () {
      this.input = true
      this.$emit('forum-input-dialog-opened')
    },
    closeForumInputDialog () {
      this.input = false
      this.$emit('forum-input-dialog-closed')
    },
    setComments (comments) {
      this.comments = comments.sort(function (a, b) {
        return a.id - b.id
      })
    },
    toggleComments () {
      this.expand = this.expand !== true
    },
    toggleQuestions () {
      this.show = this.show !== true
    },
    preview (url) {
      return url + '?size=preview'
    },
    medium (url) {
      return url + '?size=medium'
    },
    showMediaDisplay (j) {
      this.source = this.medium(this.images[j])
      this.active = true
    },
    checkSeries () {
      for (let i = 0; i < this.functionalTags.length; i++) {
        if (this.functionalTags[i].result === 'series-parent') {
          this.isSeriesParent = true
        }
        if (this.functionalTags[i].result === 'series-child') {
          this.isSeriesChild = true
        }
      }
    },
    getTags () {
      this.$axios.get(this.ogrStaUrl + '/FROST-Server/v1.1/Datastreams(' + this.id + ')/Observations' + "?$filter=parameters/type eq 'semantic'&$select=result")
        .then((response) => {
          this.semanticTags = response.data.value
          // this.seriesTag = this.checkSeriesTag()
        })
      this.$axios.get(this.ogrStaUrl + '/FROST-Server/v1.1/Datastreams(' + this.id + ')/Observations' + "?$filter=parameters/type eq 'functional'&$select=result")
        .then((response) => {
          this.functionalTags = response.data.value
          this.checkSeries()
        })
    },
    sendPost () {
      if (this.$auth.loggedIn && this.$nuxt.isOnline) {
        if (this.post.length <= 250 || this.post.length > 0) {
          this.loading = true
          this.$nuxt.$emit('loading-start')
          this.$apollo.mutate({
            mutation: commentQuestion,
            variables: {
              id: this.id,
              content: this.post
            },
            context: {
              headers: {
                Authorization: this.$auth.getToken('local')
              }
            }
          }).then((response) => {
            this.setComments(response.data.commentQuestion.comments)
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
