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
    <v-card
      v-for="n in 1"
      :key="n"
      v-ripple="false"
      class="mb-2"
      elevation="1"
    >
      <v-list-item two-line>
        <v-list-item-avatar
          tile
          size="80"
        >
          <v-skeleton-loader max-height="80" min-height="80" max-width="80" min-width="80" type="image" />
        </v-list-item-avatar>
        <v-list-item-content class="mx-0">
          <v-list-item-title class="title">
            <v-skeleton-loader class="mb-1" type="heading" />
            <v-skeleton-loader type="text, text, text" />
            <v-skeleton-loader class="mt-2" type="text" />
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'InfoCardQuestionSkeleton',

  data () {
    return {}
  }
}
</script>

<style scoped>

</style>
