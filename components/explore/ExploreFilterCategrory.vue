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
      <v-card-title>
        {{ $t('explore_filter_category_title') }}
      </v-card-title>

      <v-card-text>
        <template v-if="tree">
          <treeselect
            v-model="selectedCategory"
            :placeholder="$t('explore_filter_category_placeholder')"
            :multiple="false"
            :options="categories"
            search-nested
          >
          </treeselect>
        </template>
      </v-card-text>

      <v-card-subtitle>
        {{ $t('explore_filter_category_subtitle') }}
        <v-switch
          v-model="hierarchical"
          :label="$t('explore_filter_category_hierarchical')"
        />
      </v-card-subtitle>
      <v-card-text>
        <div class="text--primary">
          <p>
            <v-simple-table
              dense
              fixed-header
            >
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left">
                      {{ $t('explore_filter_category_category') }}
                    </th>
                    <th class="text-left">
                      {{ $t('explore_filter_category_amount') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in topCategoriesWithName"
                    :key="item.code"
                    @click="selectCategory(item)"
                  >
                    <td>{{ item.name }}</td>
                    <td>{{ item.count }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

import Treeselect from '@riophae/vue-treeselect'
// eslint-disable-next-line camelcase
import de_categories from '@/static/de_categories_ogr.json'
// eslint-disable-next-line camelcase
import en_categories from '@/static/en_categories_ogr.json'

import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { topCategoriesList, calculateTopHierarchicalCategories } from '@/util/ogr-utils.js'

export default {
  name: 'ExploreFilterCategory',

  components: {
    Treeselect
  },
  data () {
    return {
      tree: true,
      topCategories: [],
      hierarchical: false
    }
  },
  async fetch () {
    this.topCategories = await this.$axios.get('/ogr/topcategories')
      .then(res => res.data)
  },
  computed: {
    categories () {
      if (this.$i18n.locale === 'de') {
        // eslint-disable-next-line camelcase
        return de_categories
      } else {
        // eslint-disable-next-line camelcase
        return en_categories
      }
    },

    selectedCategory: {
      get () {
        return this.$store.state.ogr.category
      },
      set (value) {
        this.$store.commit('ogr/setCategory', value)
        this.$nuxt.$emit('updateLayer', 'OGR')
        this.$nuxt.$emit('updateLayer', 'OGR_Cluster')
      }
    },
    topCategoriesWithName () {
      if (this.hierarchical) {
        return calculateTopHierarchicalCategories(topCategoriesList(this.topCategories), this.$i18n.locale)
      } else {
        return topCategoriesList(this.topCategories, this.$i18n.locale)
      }
    }
  },
  methods: {
    selectCategory (item) {
      this.selectedCategory = item.code
    }
  }
}
</script>

<style scoped>
.vue-treeselect__label {
  color:black;
}
::v-deep .vue-treeselect {
  position: relative;
  text-align: left;
  font-size: 16px;
  letter-spacing: normal;
}

/* Text Eingabe */
::v-deep .vue-treeselect--has-value .vue-treeselect__input {
  line-height: inherit;
  vertical-align: middle;
}
::v-deep .vue-treeselect__input {
  min-height: 40px;
}

/* Text Auswahl */
::v-deep .vue-treeselect__single-value {
  vertical-align: middle;
  font-size: 16px;
  padding-top: 2px;
}
/* Text Placeholder */
::v-deep .vue-treeselect__placeholder {
  color: rgba(0, 0, 0, 0.6);
  padding-top: 2px;
  font-size: 16px;
  font-weight: 100;
}

/* aktives Element (Auswahl) */
::v-deep .vue-treeselect--single .vue-treeselect__option--selected {
  background: #e7f1df;
  font-weight: 500;
  color: #358706;
}
/* Listenelement (alle) */
::v-deep .vue-treeselect__indent-level-1 .vue-treeselect__option {
  padding-bottom: 3px;
  padding-top: 3px;
}
</style>
