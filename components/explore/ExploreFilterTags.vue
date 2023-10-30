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
    <v-card>
      <v-card-title>{{ $t('explore_filter_tags_title') }}</v-card-title>
      <v-card-text class="mb-0 pb-0">
        <v-combobox
          :items="items"
          :value="filteredTags"
          :loading="isLoading"
          :search-input.sync="search"
          :delimiters="delimiters"
          :label="$t('explore_filter_tags_label')"
          hint="Maximal 5 Tags"
          placeholder=""
          outlined
          dense
          hide-selected
          multiple
          hide-details
          small-chips
          deletable-chips
          @input="updateTags($event)"
        />
      </v-card-text>

      <v-card-subtitle class="mb-0 pb-0">
        {{ $t('explore_filter_tags_subtitle') }}
      </v-card-subtitle>
      <v-card-text>
        <div class="text-left">
          <template v-for="(tag) in topTags">
            <template v-if="filteredTags.indexOf(tag[0]) >= 0">
              <v-chip
                :key="tag[0]"
                class="ma-2"
                color="primary"
                pill
                small
                @click="filterForTag(tag[0])"
              >
                {{ tag[0] }}
                <v-avatar
                  class="secondary"
                  right
                >
                  <span class="white--text">
                    {{ tag[1] }}
                  </span>
                </v-avatar>
              </v-chip>
            </template>
            <template v-else>
              <v-chip
                :key="tag[0]"
                class="ma-2"
                color="primary"
                outlined
                pill
                small
                @click="filterForTag(tag[0])"
              >
                {{ tag[0] }}
                <v-avatar
                  class="primary"
                  right
                >
                  <span class="white--text">
                    {{ tag[1] }}
                  </span>
                </v-avatar>
              </v-chip>
            </template>
          </template>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  name: 'ExploreFilterTags',

  data () {
    return {
      search: null,
      isLoading: false,
      delimiters: [',', ' '],
      items: [],
      topTags: []
    }
  },

  async fetch () {
    this.topTags = await this.$axios.get('/ogr/toptags')
      .then(res => res.data)
  },

  computed: {
    ...mapState('ogr', ['filteredTags'])
  },

  watch: {
    search (val) {
      if (val == null) { return }
      // Items have already been requested
      if (this.isLoading) { return }

      if (val.length >= 3) {
        this.isLoading = true
        this.$axios.get('/ogr/tags?query=' + val)
          .then((response) => {
            this.items = response.data
            this.isLoading = false
          })
      } else {
        this.items = []
      }
    }
  },
  methods: {
    updateTags (tags) {
      this.search = null
      this.$store.commit('ogr/setTags', tags)
      this.$nuxt.$emit('updateLayer', 'OGR')
      this.$nuxt.$emit('updateLayer', 'OGR_Cluster')
    },
    filterForTag (tag) {
      // alert("Filtering for tag: " + tag)
      if (this.filteredTags.indexOf(tag) >= 0) {
        this.$store.commit('ogr/removeTag', tag)
      } else {
        this.$store.commit('ogr/addTag', tag)
      }
      this.$nuxt.$emit('updateLayer', 'OGR')
      this.$nuxt.$emit('updateLayer', 'OGR_Cluster')
    }
  }
}
</script>
