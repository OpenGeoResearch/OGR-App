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
    <v-form v-model="isFormValid">
      <v-row no-gutters>
        <v-col cols="1">
          <v-checkbox
            v-model="checkbox"
            :rules="[rules.required]"
            class="ma-0 pa-0"
          />
        </v-col>
        <v-col>
          {{ $t('auth_terms_one') }} <a target="_blank" :href="ogrWebUrl + '/nutzungsbedingungen'">{{ $t('auth_terms_use') }}</a> {{ $t('auth_terms_two') }} <a target="_blank" :href="ogrWebUrl + '/datenschutz'">{{ $t('auth_terms_data') }}</a> {{ $t('auth_terms_three') }}
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card
            class="mx-auto mb-2"
            style="display: flex !important; flex-direction: column;"
            elevation="2"
            outlined
            max-height="60vh"
          >
            <v-card-title style="word-break: break-word;">
              {{ $t('policy_info_title') }}
            </v-card-title>
            <v-card-text
              class="font-weight-medium"
              style="flex-grow: 1; overflow: auto;"
            >
              <ul>
                <li>{{ $t('policy_info_list_1') }}</li>
                <li>{{ $t('policy_info_list_2') }}</li>
                <li>{{ $t('policy_info_list_3') }}</li>
                <li>{{ $t('policy_info_list_4') }}</li>
                <li>{{ $t('policy_info_list_5') }}</li>
                <li>{{ $t('policy_info_list_6') }}</li>
                <li>{{ $t('policy_info_list_7') }}</li>
                <li>{{ $t('policy_info_list_8') }}</li>
                <li>{{ $t('policy_info_list_9') }}</li>
                <li>{{ $t('policy_info_list_10') }}</li>
                <li>{{ $t('policy_info_list_11') }}</li>
              </ul>
            </v-card-text>
          </v-card>
          <v-btn
            :disabled="!isFormValid"
            color="secondary"
            @click="$emit('click-accept')"
          >
            {{ $t('action_accept') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>

export default {
  name: 'PolicyDialog',

  data () {
    return {
      ogrWebUrl: this.$config.ogrWebUrl,
      isFormValid: false,
      checkbox: false,
      rules: {
        required: (value) => {
          return !!value || false
        }
      }
    }
  }
}
</script>
