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
  <vl-interaction-select
    ref="selectObject"
    :layers.sync="selectableLayers"
    :features.sync="selectedFeatures"
    @select="onSelect"
    @unselect="onUnselect"
  >
    <template slot-scope="select">
      <slot name="style">
        <vl-style>
          <vl-style-text
            :text="pointStyle.text"
            :font="pointStyle.font"
          />
          <vl-style-stroke
            :color="lineStyle.color"
            :width="lineStyle.width"
          />
          <vl-style-fill :color="fillStyle.color" />
        </vl-style>
      </slot>

      <slot
        name="overlay"
        :features="select.features"
      >
        <vl-overlay
          v-for="feature in select.features"
          :id="feature.id"
          :key="feature.id"
          class="feature-popup"
          :position="$findPointOnSurface(feature.geometry)"
          :auto-pan="true"
          :auto-pan-animation="{ duration: 300 }"
        />
      </slot>
    </template>
  </vl-interaction-select>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'SelectTool',
  components: {
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['map'],

  data () {
    return {
      pointStyle: {
        text: '\uF041',
        font: '60px FontAwesome',
        fill: {
          color: '#2355af'
        },
        stroke: {
          color: 'white'
        }
      },
      lineStyle: {
        color: '#d43f45',
        width: 2
      },
      fillStyle: {
        color: [254, 178, 76, 0.7]
      },
      selectByHover: false,
      selectRef: {}
    }
  },
  computed: {
    ...mapGetters('layers', ['selectableLayers']),

    selectedFeatures: {
      get () { return this.$store.state.map.selectedFeatures },
      set (value) {
        this.setSelectedFeatures(value)
      }
    },

    olMap () {
      return this.map.$map
    }
  },
  mounted () {
    this.selectRef = this.$refs.selectObject
  },
  created () {
    this.$nuxt.$on('unselectAll', () => {
      this.selectRef.unselectAll()
    })
  },
  beforeDestroy () {
    this.$nuxt.$off('unselectAll')
  },
  methods: {
    setSelectedFeatures (features) {
      this.$store.commit('map/setSelectedFeatures', features)
      this.$emit('selectedFeatures', features)
    },
    updateLayer (layerId) {
      this.$nuxt.$emit('updateLayer', layerId)
    },
    onSelect (select) {
      this.$emit('select', select)
    },
    onUnselect (unselect) {
      this.$emit('unselect', unselect)
    }
  }
}
</script>

<style>

</style>
