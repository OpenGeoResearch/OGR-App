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
  <v-container>
    <v-row>
      <v-spacer />
      <v-col cols="12">
        <v-card class="text-center">
          <v-spacer />
          <v-card-title>
            <v-spacer />
            {{ $t('external_card_title') }}
            <v-spacer />
          </v-card-title>
          <v-card-text>{{ $t('external_card_text') }}</v-card-text>
          <v-card-text>{{ link }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="secondary"
              :href="link"
              target="_self"
            >
              {{ $t('external_card_button') }}
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-col>
      <v-spacer />
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'fullscreen',

  data () {
    return {
      ogrMapUrl: this.$config.ogrMapUrl,
      link: ''
    }
  },
  mounted () {
    this.link = this.makeLink(this.$route.fullPath.substring(10))
  },
  methods: {
    makeLink (link) {
      if (link.slice(0, 4) === 'http') {
        if (link.slice(0, 5) === 'https') {
          link = 'https://' + link.substring(7)
        } else if (link.slice(0, 5) === 'http:') {
          link = 'https://' + link.substring(6)
        }
        if (link.slice(0, this.ogrMapUrl.length + 9) === this.ogrMapUrl + 'question/') {
          window.$nuxt.$router.replace(link.substring(this.ogrMapUrl.length - 1))
        }
      } else if (link.slice(0, 3) === 'www') {
        link = 'https://' + link
      }
      return decodeURIComponent(link)
    }
  }
}
</script>
