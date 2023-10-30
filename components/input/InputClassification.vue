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
    <v-subheader class="pl-0 mt-0">
      {{ $t('input_category_common') }}
    </v-subheader>
    <v-select
      v-model="topCategory"
      :items="topCategories"
      :label="category ? $t('input_category_other_select') : $t('input_category_select')"
      item-text="label"
      item-value="id"
      outlined
      dense
      single-line
      return-object
      @input="selectTopCategory"
    />
    <v-divider />
    <v-subheader
      @click="show = !show"
    >
      {{ show ? $t('input_category_all_hide') : $t('input_category_all_show') }}
      <v-icon>{{ show ? mdiChevronUp : mdiChevronDown }}</v-icon>
    </v-subheader>
    <treeselect
      v-if="show"
      v-model="category"
      class="mb-1"
      :placeholder="$t('input_category_search')"
      :multiple="false"
      :options="categories"
      search-nested
      always-open
      :clearable="false"
      :default-expand-level="2"
      value-format="object"
      @input="selectCategory"
    />
  </v-container>
</template>

<script>
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'
// eslint-disable-next-line camelcase
import de_categories_ogr from '@/static/de_categories_ogr.json'
// eslint-disable-next-line camelcase
import de_categories_top from '@/static/de_categories_top.json'
// eslint-disable-next-line camelcase
import en_categories_ogr from '@/static/en_categories_ogr.json'
// eslint-disable-next-line camelcase
import en_categories_top from '@/static/en_categories_top.json'

export default {
  name: 'InputClassification',

  data () {
    return {
      mdiChevronUp,
      mdiChevronDown,
      category: undefined,
      topCategory: undefined,
      show: false
    }
  },

  computed: {
    categories () {
      if (this.$i18n.locale === 'de') {
        // eslint-disable-next-line camelcase
        return de_categories_ogr
      } else {
        // eslint-disable-next-line camelcase
        return en_categories_ogr
      }
    },
    topCategories () {
      if (this.$i18n.locale === 'de') {
        // eslint-disable-next-line camelcase
        return de_categories_top
      } else {
        // eslint-disable-next-line camelcase
        return en_categories_top
      }
    }
  },

  beforeMount () {
    this.restoreCategory()
  },

  methods: {
    selectCategory () {
      if (this.category) {
        this.topCategory = null
        this.updateCategory(this.category.id, this.category.label, this.category.ogr)
      }
    },
    selectTopCategory () {
      if (this.topCategory) {
        this.category = undefined
        this.updateCategory(this.topCategory.id, this.topCategory.label, this.topCategory.ogr)
      }
    },
    async updateCategory (id, label, ogr) {
      if (id && label) {
        this.$emit('input', { id, name: label })
      } else {
        this.$emit('input', { id: 0, name: 'Unbekannte Kategorie' })
      }

      this.$emit('update-input-cache')
      if (id === 0) {
        await this.$localforage.cache.setItem('category', undefined)
      } else {
        await this.$localforage.cache.setItem('category', { category: { id, label, ogr } })
      }
    },
    async restoreCategory () {
      const cache = await this.$localforage.cache.getItem('category')
      if (cache) {
        if (cache.category) {
          if (cache.category.ogr === true) {
            this.category = cache.category
          } else if (cache.category.ogr === false) {
            this.topCategory = cache.category
          }
        }
      }
    }
  }
}
</script>

<style scoped>
::v-deep .vue-treeselect {
  position: relative;
  text-align: left;
  font-size: 16px;
  letter-spacing: normal;
}

/* #### Search container #### */
::v-deep .vue-treeselect__control {
  border: 2px solid #358706;
  border-bottom: 2px solid #e9e9e9;
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

/* #### Select container #### */
::v-deep .vue-treeselect__menu {
  border-left: 2px solid #358706;
  border-right: 2px solid #358706;
  border-bottom: 2px solid #358706;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-top: 0 solid #e9e9e9;
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

::v-deep .v-select__selections {
  text-transform: none;
}
</style>
