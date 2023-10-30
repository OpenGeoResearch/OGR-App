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
      :active="report"
      :invalid="!isFormValid"
      :label="$t('action_submit').toString()"
      @click-dialog-close="closeForumInputDialog"
      @click-dialog-check="sendReport"
    >
      <v-form v-model="isFormValid">
        <v-select
          v-model="reason"
          :items="reasons"
          :label="$t('report_select_label')"
          item-value="id"
          item-text="label"
          outlined
          dense
          single-line
          :rules="[rules.required]"
        />
        <v-textarea
          v-model="description"
          class="mt-1"
          :rules="[rules.length(250)]"
          counter="250"
          outlined
          no-resize
          :disabled="loading"
          :label="$t('report_description_label')"
          placeholder=""
          rows="4"
        />
      </v-form>
    </forum-input-dialog>
    <v-menu
      v-model="menu"
      :close-on-content-click="true"
      offset-y
      bottom
      right
    >
      <template v-if="this.$auth.loggedIn && this.$nuxt.isOnline" #activator="{ on, attrs }">
        <v-icon
          color="neutral"
          v-bind="attrs"
          v-on="on"
        >
          {{ mdiDotsVertical }}
        </v-icon>
      </template>

      <v-list class="pa-0">
        <v-list-item
          dense
          @click="openForumInputDialog"
        >
          <v-list-item-icon>
            <v-icon>
              {{ mdiAlertOctagon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>Melden</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>

import { mdiDotsVertical, mdiAlertOctagon, mdiCheck, mdiAlert } from '@mdi/js'
import ForumInputDialog from '~/components/forum/ForumInputDialog'

export default {
  name: 'ForumContentMenu',
  components: { ForumInputDialog },

  props: {
    // eslint-disable-next-line vue/require-prop-types
    id: {
      required: true,
      default: null
    },
    reportType: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      mdiDotsVertical,
      mdiAlertOctagon,
      mdiCheck,
      mdiAlert,
      menu: false,
      report: false,
      loading: false,
      reason: undefined,
      description: '',
      reasons: [
        { id: 1, label: this.$t('report_reason_hate_speech'), enum: 'REASON_HATE_SPEECH' },
        { id: 2, label: this.$t('report_reason_inappropriate_content'), enum: 'REASON_INAPPROPRIATE_CONTENT' },
        { id: 3, label: this.$t('report_reason_explicit_language'), enum: 'REASON_EXPLICIT_LANGUAGE' }
      ],
      rules: {
        required: (value) => { return !!value || this.$t('auth_rule_mandatory') },
        length: len => v => (v || '').length <= len || this.$t('input_text_length', [len])
      },
      isFormValid: false
    }
  },

  methods: {
    openForumInputDialog () {
      this.report = true
      this.$emit('forum-input-dialog-opened')
    },
    closeForumInputDialog () {
      this.report = false
      this.$emit('forum-input-dialog-closed')
    },
    resetReportForm () {
      this.report = false
      this.reason = undefined
      this.description = ''
      this.$emit('forum-input-dialog-closed')
    },
    sendReport () {
      if (this.$auth.loggedIn && this.$nuxt.isOnline) {
        this.$nuxt.$emit('loading-start')
        this.$axios.post('/ogr/report/' + this.reportType,
          {
            reason: this.reason,
            text: this.description === '' ? 'Keine Beschreibung angegeben' : this.description,
            id: this.id,
            username: this.$auth.user.username
          })
          .then((response) => {
            if (response.status === 200) {
              this.$nuxt.$emit('loading-status', { status: true, message: this.$t('loading_success_messsage_standard') })
              this.resetReportForm()
            }
          })
          .catch(() => {
            this.$nuxt.$emit('loading-status', { status: false, message: this.$t('loading_error_messsage_standard') })
            this.resetReportForm()
          })
      }
    }
  }
}
</script>

<style scoped>

::v-deep .v-select__selections {
  text-transform: none;
}
</style>
