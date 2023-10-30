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
  <v-container
    fluid
  >
    <v-select
      v-model="selectedLocale"
      class="mt-1 ml-1"
      :items="availableLocales"
      item-text="code"
      item-value="code"
      dense
      style="max-width: 70px;"
    />
    <v-row>
      <v-col>
        <v-card
          class="mx-auto"
          max-width="800"
          elevation="4"
        >
          <v-img
            src="/ogr_placeholder.png"
            height="200px"
          />

          <v-card-title>
            {{ $t('landing_title') }}
          </v-card-title>

          <v-card-subtitle>
            {{ $t('landing_subtitle') }}
          </v-card-subtitle>

          <v-card-text class="text--primary">
            {{ $t('landing_text_primary') }}
          </v-card-text>

          <v-card-text class="text--secondary">
            {{ $t('landing_text_secondary') }}
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              text
              @click="show = !show"
            >
              {{ $t('landing_button') }}
            </v-btn>

            <v-spacer />

            <v-btn
              icon
              @click="show = !show"
            >
              <v-icon>{{ show ? mdiChevronUp : mdiChevronDown }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <div v-show="show">
              <v-divider />
              <v-card-text>
                {{ $t('landing_info_ios_header') }}<br>
                {{ $t('landing_info_ios_first') }} <v-icon>{{ mdiExportVariant }}</v-icon> {{ $t('landing_info_ios_second') }}<br>
                {{ $t('landing_info_ios_third') }}
              </v-card-text>
              <v-card-text>
                {{ $t('landing_info_android_chrome_header') }}<br>
                {{ $t('landing_info_android_chrome_first') }} <v-icon>{{ mdiDotsVertical }}</v-icon> {{ $t('landing_info_android_chrome_second') }}<br>
                {{ $t('landing_info_android_chrome_third') }}
              </v-card-text>
              <v-card-text>
                {{ $t('landing_info_android_firefox_header') }}<br>
                {{ $t('landing_info_android_firefox_first') }} <v-icon>{{ mdiDotsVertical }}</v-icon> {{ $t('landing_info_android_firefox_second') }}<br>
                {{ $t('landing_info_android_firefox_third') }}
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiChevronUp, mdiChevronDown, mdiExportVariant, mdiDotsVertical } from '@mdi/js'

export default {
  name: 'Landing',
  layout: 'landing',

  data () {
    return {
      mdiChevronUp,
      mdiChevronDown,
      mdiExportVariant,
      mdiDotsVertical,
      show: false
    }
  },

  computed: {
    availableLocales () {
      return this.$i18n.locales
    },
    selectedLocale: {
      get () {
        return this.$i18n.locale
      },
      set (newValue) {
        if (newValue !== this.$i18n.locale) {
          this.$i18n.setLocale(newValue)
        }
      }
    }
  }
}
</script>
