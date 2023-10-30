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
      v-if="images.length > 0"
      multiple
      show-arrows
    >
      <v-slide-item
        v-for="(image, i) in images"
        :key="i"
        class="mt-1 mb-1 mr-1"
      >
        <v-img
          :src="images[i]"
          style="width: 80px; float: left; max-width: 80px; text-align: end;"
          aspect-ratio="1"
        >
          <v-btn
            icon
            dark
            @click="onClickDelete(i)"
          >
            <v-icon>
              {{ mdiCloseCircleOutline }}
            </v-icon>
          </v-btn>
        </v-img>
      </v-slide-item>

      <label>
        <div v-if="images.length > 0 && images.length < 5">
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
          accept="image/*"
          @change="onSelectFile"
        >
      </label>
    </v-slide-group>

    <label v-if="images.length === 0">
      <div>
        <input-list
          :title="$t('input_image_title')"
          :subtitle="$t('input_image_text')"
          :hint="permission ? `Hint` : $t('permission_camera_hint')"
          :icon="mdiImage"
          color="tertiary"
        />
      </div>

      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept="image/*"
        @change="onSelectFile"
      >
    </label>
  </v-sheet>
</template>

<script>
import { mdiImage, mdiPlusBox, mdiCloseCircleOutline } from '@mdi/js'
import InputList from '../input/InputList.vue'

export default {
  name: 'InputImage',
  components: { InputList },

  data () {
    return {
      mdiImage,
      mdiPlusBox,
      mdiCloseCircleOutline,
      images: [],
      input: {
        files: [],
        names: []
      },
      permission: false
    }
  },

  created () {
    this.checkPermission()
    this.restoreImages()
    this.$nuxt.$on('update-files', (file) => {
      if (file.size / 1024 / 1024 > 5) {
        this.$emit('input-media-too-large')
        this.images.pop()
      } else {
        this.input.files.push(file)
        this.input.names.push(file.name)
        this.cacheImages()
        this.$emit('input-media-image', this.input)
      }
    })
  },

  beforeDestroy () {
    this.$nuxt.$off('update-files')
  },

  methods: {
    async cacheImages () {
      await this.$localforage.cache.setItem('images', this.input)
    },
    async restoreImages () {
      const cache = await this.$localforage.cache.getItem('images')
      if (cache) {
        this.input = cache
        this.$emit('input-media-image', this.input)
        cache.files.forEach(element =>
          this.onRestoreFile(element))
      }
    },
    checkPermission () {
      if (window.localStorage.getItem('camera-permission') === 'true') {
        this.permission = true
      }
    },
    onRestoreFile (file) {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.images.push(e.target.result)
        }
        reader.readAsDataURL(file)
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
        const name = file.name
        const reader = new FileReader()
        reader.onload = (e) => {
          this.images.push(e.target.result)
          this.resizeImage(e.target.result, name)
        }
        reader.readAsDataURL(file)
      }
    },
    onClickDelete (i) {
      this.input.files.splice(i, 1)
      this.input.names.splice(i, 1)
      this.images.splice(i, 1)
      this.cacheImages()
    },
    resizeImage (file, name) {
      const img = new Image()
      img.src = file
      img.onload = function () {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const ratio = 0.5
        const width = img.width * ratio
        const height = img.height * ratio

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg')
        window.$nuxt.$emit('update-files', dataURItoBlob(dataUrl, name))

        function dataURItoBlob (dataURI, name) {
          const byteString = atob(dataURI.split(',')[1])
          const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }

          const blob = new Blob([ab], { type: mimeString })
          return new File([blob], name, { type: mimeString })
        }
      }
    }
  }
}
</script>

<style >
.input-image {
  display: block;
  width: 100px;
  height: 100px;
  cursor: pointer;
  background-size: cover;
  background-position: center center;
}
.placeholder {
  background: #f0f0f0;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  font-size: 18px;
  font-family: Helvetica;
}
.placeholder:hover {
  background: #e0e0e0;
}
.file-input {
  display: none;
}
</style>
