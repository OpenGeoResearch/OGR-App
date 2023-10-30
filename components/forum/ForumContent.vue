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
  <div v-if="questionData" v-show="loaded">
    <forum-input-dialog
      :active="input"
      :invalid="post.length > 4000 || post.length === 0"
      :label="$t('action_submit').toString()"
      @click-dialog-close="closeForumInputDialog"
      @click-dialog-check="sendPost"
    >
      <v-textarea
        v-model="post"
        class="mt-1"
        :rules="[rules.length(4000)]"
        counter="4000"
        outlined
        autofocus
        :disabled="loading"
        :label="$t('forum_input_answer_label')"
        placeholder=""
        rows="4"
      />
    </forum-input-dialog>

    <forum-question-with-comments
      :id="questionId"
      :question="question"
      :description="description"
      :category="category"
      :images="images"
      :votes="questionData.votes"
      :comment-data="questionData.comments"
      @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
      @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
      @click-show-series="$emit('click-show-series')"
    />
    <v-row no-gutters>
      <v-spacer />
      <v-btn
        small
        plain
        color="neutral"
        :disabled="!(this.$auth.loggedIn && this.$nuxt.isOnline)"
        @click="openForumInputDialog"
      >
        {{ $t('forum_add_answer') }}
        <v-icon class="ml-1">
          {{ mdiMessagePlus }}
        </v-icon>
      </v-btn>
      <v-spacer />
    </v-row>
    <v-banner
      v-if="expertAnswers.length > 0"
      dark
      single-line
      class="mt-5 mb-0"
      elevation="3"
      :icon="mdiSchool"
      color="secondary"
    >
      {{ $t('forum_banner_answers_expert') }}
    </v-banner>
    <forum-answer-with-comments
      v-for="answer in expertAnswers"
      :key="answer.id"
      :answer-data="answer"
      @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
      @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
    />
    <v-banner
      v-if="communityAnswers.length > 0"
      dark
      single-line
      class="mt-5 mb-0"
      elevation="3"
      :icon="mdiAccountGroup"
      color="secondary"
    >
      {{ $t('forum_banner_answers_community') }}
    </v-banner>
    <forum-answer-with-comments
      v-for="answer in communityAnswers"
      :key="answer.id"
      :answer-data="answer"
      @forum-input-dialog-opened="$emit('forum-input-dialog-opened')"
      @forum-input-dialog-closed="$emit('forum-input-dialog-closed')"
    />
  </div>
  <div v-else>
    <forum-skeleton />
  </div>
</template>

<script>
import { mdiAccountGroup, mdiSchool, mdiMessagePlus } from '@mdi/js'
import question from '@/apollo/queries/question'
import ForumAnswerWithComments from '~/components/forum/ForumAnswerWithComments'
import ForumQuestionWithComments from '~/components/forum/ForumQuestionWithComments'
import ForumSkeleton from '~/components/forum/ForumSkeleton'
import ForumInputDialog from '~/components/forum/ForumInputDialog'
import answerQuestion from '~/apollo/mutations/answerQuestion.gql'

export default {
  name: 'ForumContent',
  components: { ForumInputDialog, ForumSkeleton, ForumQuestionWithComments, ForumAnswerWithComments },

  props: {
    questionId: {
      type: String,
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
    }
  },

  data () {
    return {
      mdiAccountGroup,
      mdiSchool,
      mdiMessagePlus,
      questionData: undefined,
      answerData: undefined,
      expertAnswers: [],
      communityAnswers: [],
      loaded: false,
      input: false,
      post: '',
      rules: {
        length: len => v => (v || '').length <= len || this.$t('input_text_length', [len])
      },
      loading: false
    }
  },

  created () {
    if (this.questionId) {
      this.getQuestionData()
    }
  },

  methods: {
    openForumInputDialog () {
      this.input = true
      this.$emit('forum-input-dialog-opened')
    },
    closeForumInputDialog () {
      this.input = false
      this.$emit('forum-input-dialog-closed')
    },
    getQuestionData () {
      this.$apollo.query({
        query: question,
        variables: {
          id: this.questionId
        },
        fetchPolicy: 'no-cache',
        context: {
          headers: {
            Authorization: this.$auth.getToken('local')
          }
        }
      }).then((response) => {
        if (response.data.question) {
          this.questionData = response.data.question
          this.splitAnswers(this.questionData.answers)
          this.sortByDate()
          this.loaded = true
        }
      })
    },
    splitAnswers (answers) {
      const expertAnswers = []
      const communityAnswers = []

      for (const answer of answers) {
        let isExpert = false
        for (const role of answer.user.roles) {
          if (role.name === 'ROLE_EXPERT') {
            isExpert = true
          }
        }

        if (isExpert) {
          expertAnswers.push(answer)
        } else {
          communityAnswers.push(answer)
        }
      }

      this.expertAnswers = expertAnswers
      this.communityAnswers = communityAnswers
    },
    sortByDate () {
      this.expertAnswers = this.expertAnswers.sort((a, b) => new Date(b.created) - new Date(a.created))
    },
    sortByVote () {
      this.expertAnswers = this.expertAnswers.sort((a, b) => b.votes.upCount - a.votes.upCount)
    },
    sendPost () {
      if (this.$auth.loggedIn && this.$nuxt.isOnline) {
        if (this.post.length <= 4000 || this.post.length > 0) {
          this.loading = true
          this.$nuxt.$emit('loading-start')
          this.$apollo.mutate({
            mutation: answerQuestion,
            variables: {
              id: this.questionId,
              content: this.post
            },
            context: {
              headers: {
                Authorization: this.$auth.getToken('local')
              }
            }
          }).then((response) => {
            this.splitAnswers(response.data.answerQuestion.answers)
            this.sortByDate()
            this.post = ''
            this.$nuxt.$emit('loading-status', { status: true, message: this.$t('loading_success_messsage_standard') })
            this.loading = false
            this.closeForumInputDialog()
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
