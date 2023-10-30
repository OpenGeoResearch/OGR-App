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
  <div id="mini-map">
    <vl-map
      ref="map"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      data-projection="EPSG:4326"
      :style="style"
    >
      <!-- eslint-disable vue/no-mutating-props -->
      <vl-view
        :zoom.sync="map.zoom"
        :center.sync="map.center"
        :rotation="map.rotation"
      />
      <!-- eslint-enable -->
      <vl-feature v-if="markerCoords" id="marker-feature">
        <vl-geom-point :coordinates="markerCoords" />
        <vl-style-box>
          <vl-style-icon src="/marker_primary.png" :scale="0.3" :anchor="[0.5, 1]" />
        </vl-style-box>
      </vl-feature>

      <vl-feature v-if="lastCoords" id="position-feature">
        <vl-geom-point :coordinates="lastCoords" />
        <vl-style-box>
          <vl-style-icon src="/marker_primary.png" :scale="0.3" :anchor="[0.5, 1]" :opacity="0.5" />
        </vl-style-box>
      </vl-feature>

      <vl-layer-tile id="mini-osm">
        <vl-source-osm />
      </vl-layer-tile>
    </vl-map>
  </div>
</template>

<script>

export default {
  name: 'MapMini',

  props: {
    map: undefined,
    markerCoords: undefined,
    lastCoords: undefined
  },

  data () {
    return {
      style: 'height: 115px;'
    }
  },

  created () {
    if (this.$vuetify.theme.dark) {
      this.style = 'height: 115px; opacity: 0.9;'
    } else {
      this.style = 'height: 115px;'
    }
  }
}
</script>
