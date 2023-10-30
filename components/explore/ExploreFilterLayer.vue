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
  <div v-if="false">
    <v-card>
      <v-card-title class="mb-2 pb-0">{{ $t('filter_layer_title') }}</v-card-title>
      <v-card-actions class="mb-0 pb-0 mt-0 pt-0">
        <v-switch
          class="mb-0 pb-0 mt-0 pt-0"
          :value="true"
          :input-value="true"
          color="primary"
          :label="$t('filter_layer_label_question')"
          readonly
          disabled
        />
      </v-card-actions>
      <v-card-actions class="mb-0 pb-0 mt-0 pt-0">
        <v-switch
          class="mb-0 pb-0 mt-0 pt-0"
          :value="seriesLayersVisible"
          :input-value="seriesLayersVisible"
          color="info"
          :label="$t('filter_layer_label_series')"
          @change="toggleSeriesLayers"
        />
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ExploreFilterLayer',

  data () {
    return {

    }
  },

  computed: {
    ...mapState('ogr', ['seriesLayersVisible'])
  },

  methods: {
    showSeries () {
      this.$nuxt.$emit('setLayerVisibility', 'OGR_Series', true)
      this.$nuxt.$emit('setLayerVisibility', 'OGR_Series_Cluster', true)
    },
    hideSeries () {
      this.$nuxt.$emit('setLayerVisibility', 'OGR_Series', false)
      this.$nuxt.$emit('setLayerVisibility', 'OGR_Series_Cluster', false)
    },
    toggleSeriesLayers () {
      if (this.seriesLayersVisible) {
        this.hideSeries()
      } else {
        this.showSeries()
      }
    }
  }
}
</script>
