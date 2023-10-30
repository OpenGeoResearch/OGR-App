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
  <div id="select-map">
    <vl-map
      id="select-map"
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
      <vl-feature v-if="lastCoords" id="position-feature">
        <vl-geom-point :coordinates="lastCoords" />
        <vl-style-box>
          <vl-style-icon src="/marker_primary.png" :scale="0.3" :anchor="[0.5, 1]" :opacity="0.5" />
        </vl-style-box>
      </vl-feature>

      <vl-layer-tile id="select-osm">
        <vl-source-osm />
      </vl-layer-tile>
    </vl-map>
    <v-list-item :disabled="manual" one-line @click="$emit('click-center-map')">
      <v-list-item-action>
        <v-btn
          :disabled="manual"
          icon
        >
          <v-icon>{{ mdiCrosshairsGps }}</v-icon>
        </v-btn>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>{{ $t('input_location_center') }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </div>
</template>

<script>
import { mdiCrosshairsGps } from '@mdi/js'
import Control from 'ol/control/Control'

export default {
  name: 'MapSelect',

  props: {
    map: undefined,
    lastCoords: undefined,
    markerCoords: undefined,
    manual: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      mdiCrosshairsGps,
      style: ''
    }
  },
  beforeMount () {
    this.style = this.createStyle()
  },
  mounted () {
    if (this.manual) {
      // eslint-disable-next-line vue/no-mutating-props
      this.map.zoom = 6
    } else {
      // eslint-disable-next-line vue/no-mutating-props
      this.map.zoom = 18
    }
    const myElement = document.createElement('div')
    myElement.className = 'ol-mycontrol ol-control'

    this.$refs.map.$createPromise.then(() => {
      this.$refs.map.$map.addControl(new Control({ element: myElement }))
    })
  },
  methods: {
    createStyle () {
      const height = '' + window.innerHeight - 56 - 60 - 20 - 10 + 'px'
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
.ol-mycontrol {
    left: 50%;
    top: 50%;
    width: 26px;
    height: 40px;
    margin: -39px 0px 0px -13px;
    background: no-repeat url("/marker_primary.png");
    background-size: 26px
}
</style>
