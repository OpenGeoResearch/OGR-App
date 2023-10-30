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
  <div id="info-map">
    <vl-map
      id="info-map"
      ref="map"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      data-projection="EPSG:4326"
      :style="style"
    >
      <vl-view
        :zoom="zoom"
        :center="coords"
      />

      <vl-feature v-if="coords" id="position-feature">
        <vl-geom-point :coordinates="coords" />
        <vl-style-box>
          <vl-style-icon :src="marker" :scale="0.3" :anchor="[0.5, 1]" :opacity="1" />
        </vl-style-box>
      </vl-feature>

      <vl-feature v-for="child in seriesChildren" :id="'child-feature-' + child.id" :key="child.id">
        <vl-geom-point :coordinates="child.datastream.observedArea.coordinates" />
        <vl-style-box>
          <vl-style-icon src="/marker_info.png" :scale="0.3" :anchor="[0.5, 1]" :opacity="1" />
        </vl-style-box>
      </vl-feature>

      <vl-layer-tile id="select-osm">
        <vl-source-osm />
      </vl-layer-tile>
    </vl-map>
  </div>
</template>

<script>

export default {
  name: 'InfoMap',

  props: {
    coords: undefined,
    marker: {
      type: String,
      required: false,
      default: '/marker_primary.png'
    },
    zoom: {
      type: Number,
      required: false,
      default: 18
    },
    seriesChildren: {
      type: Array,
      required: false,
      default: () => { return [] }
    }
  },

  data () {
    return {
      style: ''
    }
  },

  created () {
    this.style = this.createStyle()
  },

  methods: {
    createStyle () {
      const height = '' + window.innerHeight - 56 - 20 - 10 + 'px'
      let opacity = ''
      if (this.$vuetify.theme.dark) {
        opacity = '0.9'
      }
      return 'height: ' + height + '; opacity: ' + opacity + ';'
    }
  }
}
</script>

<style>
#info-map {
  width: 100%;
  height: calc(95vh - 100px)
}
</style>
