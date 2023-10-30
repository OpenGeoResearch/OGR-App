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
    <v-slide-group
      v-if="videos.length > 0"
      show-arrows
    >
      <v-slide-item
        v-for="(audio, i) in videos"
        v-slot="{ active, toggle }"
        :key="i"
        class="mt-1 mb-1 mr-1"
      >
        <div
          v-if="player"
          style="float: left; max-width: 80px"
        >
          <v-dialog
            :value="active"
            persistent
          >
            <video
              v-if="active"
              :id="'video-player-' + i"
              :src="videos[i]"
              width="100%"
              autoplay
              controls
              playsInline
            >
              Your browser does not support the
              <code>audio</code> element.
            </video>

            <v-btn
              small
              color="highlight"
              @click="toggle"
            >
              Schließen
            </v-btn>
          </v-dialog>

          <v-img
            width="80px"
            height="80px"
            :src="thumbnails[i]"
          >
            <v-row>
              <v-col
                class="pa-0 pr-3 pt-3 text-right"
              >
                <v-btn
                  dark
                  icon
                  @click="onClickDelete(i)"
                >
                  <v-icon>
                    {{ mdiCloseCircleOutline }}
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                class="pa-0 text-center"
              >
                <v-btn
                  dark
                  icon
                  @click="toggle"
                >
                  <v-icon x-large>
                    {{ active ? mdiPause : mdiPlay }}
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-img>
        </div>
      </v-slide-item>

      <label v-if="videos.length > 0 && videos.length < 2">
        <div
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
          accept="video/*"
          @change="onSelectFile"
        >
      </label>
    </v-slide-group>

    <label v-if="videos.length === 0">
      <div>
        <input-list
          :title="$t('input_video_title')"
          :subtitle="$t('input_video_text')"
          :hint="permission ? `Hint` : $t('permission_camera_hint')"
          :icon="mdiVideo"
          color="tertiary"
        />
      </div>

      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept="video/*"
        @change="onSelectFile"
      >
    </label>
  </v-sheet>
</template>

<script>
import { mdiPlay, mdiPause, mdiCloseCircleOutline, mdiVideo, mdiPlusBox } from '@mdi/js'
import InputList from '../input/InputList.vue'

export default {
  name: 'InputVideo',
  components: { InputList },

  data () {
    return {
      mdiPlay,
      mdiPause,
      mdiCloseCircleOutline,
      mdiVideo,
      mdiPlusBox,
      playerElement: undefined,
      isPlaying: null,
      player: false,
      button: true,
      videos: [],
      input: {
        files: [],
        names: []
      },
      thumbnails: [],
      absolute: false,
      zIndex: 10,
      permission: false
    }
  },

  created () {
    this.checkPermission()
    this.$nuxt.$on('update-thumbnails', (thumbnail) => {
      this.thumbnails.push(thumbnail)
    })
  },

  beforeDestroy () {
    this.$nuxt.$off('update-thumbnails')
  },

  methods: {
    checkPermission () {
      if (window.localStorage.getItem('camera-permission') === 'true') {
        this.permission = true
      }
    },
    onSelectFile (e) {
      if (this.permission === false) {
        window.localStorage.setItem('camera-permission', 'true')
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
          this.videos.push(e.target.result)
          this.createThumbnail(e.target.result)
        }
        reader.readAsDataURL(file)
        this.player = true
        this.button = false
        this.$nuxt.$emit('input-media-video', this.input)
      }
    },
    onClickDelete (i) {
      if (this.isPlaying !== null) {
        this.playerElement = document.getElementById('video-player-' + this.isPlaying)
        this.playerElement.pause()
        this.isPlaying = null
      }
      this.input.files.splice(i, 1)
      this.input.names.splice(i, 1)
      this.videos.splice(i, 1)
    },
    createThumbnail (file) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = file
      video.muted = true
      video.playsInline = true
      video.currentTime = 1
      video.play().then(drawThumb)
      function drawThumb () {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        window.$nuxt.$emit('update-thumbnails', canvas.toDataURL())
        video.pause()
        video.removeAttribute('src')
        video.load()
      }
    }
  }
}
</script>
