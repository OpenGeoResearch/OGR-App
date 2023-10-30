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
    <v-row>
      <v-col>
        <info-card
          v-if="error.statusCode === 404"
          :title="$t('error_not_found_title')"
          :subtitle="$t('error_not_found_subtitle')"
          :text="$t('error_not_found_text')"
        />
        <info-card
          v-else
          :title="$t('error_other_title')"
          :subtitle="$t('error_other_subtitle')"
          :text="$t('error_other_text')"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col align="center">
        <v-btn
          color="secondary"
          to="/home"
        >
          {{ $t('dialog_to_home') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import InfoCard from '~/components/info/InfoCard.vue'

export default {
  components: { InfoCard },
  layout: 'empty',

  props: {
    error: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  },

  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
