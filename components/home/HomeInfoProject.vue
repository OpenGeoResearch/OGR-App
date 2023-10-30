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
  <v-card
    class="mx-auto"
    color="info"
    dark
    width="100%"
  >
    <v-list-item class="ma-0">
      <v-list-item-content class="pa-0 ma-0">
        <v-list-item-subtitle class="pa-0 ma-0 white--text text-subtitle-1">
          {{ $t('info_banner_project_ended_title') }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn
          v-ripple="false"
          class="pr-0"
          style="align-self: start"
          small
          plain
          color="white"
          @click="expand = !expand"
        >
          <v-icon>{{ expand ? mdiChevronUp : mdiChevronDown }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-expand-transition>
      <v-list-item v-if="expand" class="ma-0 pb-1">
        <span class="white--text text-subtitle-1">{{ $t('info_banner_project_ended_text') }}</span>
      </v-list-item>
    </v-expand-transition>
  </v-card>
</template>

<script>
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'

export default {
  name: 'HomeInfoProject',

  data () {
    return {
      mdiChevronUp,
      mdiChevronDown,
      expand: false
    }
  }
}
</script>
