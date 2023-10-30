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
  <v-sheet
    max-width="100%"
    style="background-color: transparent !important;"
  >
    <v-card
      class="mb-5"
      v-for="(audio, i) in audios"
      :key="i"
      width="100%"
      shaped
      dense
      color="highlight"
    >
      <v-row
        v-if="player"
        style="align-items: center;"
        class="pl-6 pr-4 mt-1"
      >
        <audio
          :id="'audio-player-' + i"
          :src="audios[i]"
        >
          Your browser does not support the
          <code>audio</code> element.
        </audio>
        Audio {{ i + 1 }}

        <v-spacer />

        <v-btn
          icon
          @click="onClickPlayPause(i)"
        >
          <v-icon x-large>
            {{ isPlaying === i ? mdiPause : mdiPlay }}
          </v-icon>
        </v-btn>

        <v-spacer />

        <v-btn
          icon
          @click="onClickDelete(i)"
        >
          <v-icon>
            {{ mdiCloseCircleOutline }}
          </v-icon>
        </v-btn>
      </v-row>
    </v-card>

    <label>
      <div v-if="audios.length === 0 && audios.length < 3">
        <input-list
          :title="$t('input_audio_title')"
          :subtitle="$t('input_audio_text')"
          :hint="permission ? `Hint` : $t('permission_microphone_hint')"
          :icon="mdiMicrophone"
          color="tertiary"
        />
      </div>

      <div
        v-if="audios.length > 0"
        class="text-right"
      >
        <v-icon
          x-large
          color="secondary"
        >
          {{ mdiPlusBox }}
        </v-icon>
      </div>

      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept="audio/*"
        @change="onSelectFile"
      >
    </label>
  </v-sheet>
</template>

<script>
import { mdiPlay, mdiPause, mdiCloseCircleOutline, mdiMicrophone, mdiPlusBox } from '@mdi/js'
import InputList from '../input/InputList.vue'

export default {
  name: 'InputAudio',
  components: { InputList },

  data () {
    return {
      mdiPlay,
      mdiPause,
      mdiCloseCircleOutline,
      mdiMicrophone,
      mdiPlusBox,
      playerElement: undefined,
      isPlaying: null,
      player: false,
      button: true,
      audios: [],
      input: {
        files: [],
        names: []
      },
      permission: false
    }
  },

  created () {
    this.checkPermission()
  },

  methods: {
    checkPermission () {
      if (window.localStorage.getItem('microphone-permission') === 'true') {
        this.permission = true
      }
    },
    onSelectFile (e) {
      if (this.permission === false) {
        window.localStorage.setItem('microphone-permission', 'true')
        this.permission = true
      }
      let file = null
      if (e.target.files.length > 0) {
        file = e.target.files[0]
      } else {
        return
      }
      if (file) {
        if (file.size > 5000000) { // 5242880
          this.$nuxt.$emit('input-media-too-large')
          return
        }
        this.input.files.push(file)
        this.input.names.push(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          this.audios.push(e.target.result)
        }
        reader.readAsDataURL(file)
        this.player = true
        this.button = false
        this.$nuxt.$emit('input-media-audio', this.input)
      }
    },
    onClickDelete (i) {
      if (this.isPlaying !== null) {
        this.playerElement = document.getElementById('audio-player-' + this.isPlaying)
        this.playerElement.pause()
        this.isPlaying = null
      }
      this.input.files.splice(i, 1)
      this.input.names.splice(i, 1)
      this.audios.splice(i, 1)
    },
    onClickPlayPause (i) {
      if (this.isPlaying === null) {
        this.playerElement = document.getElementById('audio-player-' + i)
        this.playerElement.play()
        this.isPlaying = i
      } else if (this.isPlaying === i) {
        this.playerElement = document.getElementById('audio-player-' + this.isPlaying)
        this.playerElement.pause()
        this.isPlaying = null
      } else if (this.isPlaying !== null && this.isPlaying !== i) {
        this.playerElement = document.getElementById('audio-player-' + this.isPlaying)
        this.playerElement.pause()
        this.playerElement = document.getElementById('audio-player-' + i)
        this.playerElement.play()
        this.isPlaying = i
      }
    }
  }
}
</script>
