/*
*    Copyright (C) 2023 Geodätisches Institut RWTH Aachen University,
*    Mies-van-der-Rohe-Straße 1, D 52074 Aachen, Germany.
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import axios from 'axios'
import * as localForage from 'localforage'
import { createQuestion, createFormData } from '@/util/url-utils.js'

localForage.config({ storeName: 'storage' })

function sendErrorReport (code, err, ogrApiUrl) {
  const request = {
    error: code,
    text: JSON.stringify(err)
  }
  const config = createConfig('application/json')
  axios.post(ogrApiUrl + '/ogr/error/', request, config)
}

function createConfig (type, token) {
  if (token) {
    return { headers: { 'Content-Type': type, Authorization: token } }
  } else {
    return { headers: { 'Content-Type': type } }
  }
}

async function storeQuestion (key, value, uploadUrl) {
  value.url = uploadUrl
  await localForage.setItem(key, value)
}

function postImageData (uploadUrl, value, token, key, ogrApiUrl) {
  self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_images' })
  if (value.files.images.length > 0 || value.files.audios.length > 0 || value.files.videos.length > 0) {
    const url = ogrApiUrl + uploadUrl
    const formData = createFormData(value.files)
    const config = createConfig('multipart/form-data', token)
    return new Promise(function (resolve, reject) {
      axios.post(url, formData, config)
        .then(async (response) => {
          if (response.status === 200) {
            self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_question_deleted' })
            await localForage.removeItem(key)
            return resolve(response)
          }
          return reject(Error('Request failed with status code: ' + response.status))
        })
        .catch(async (err) => {
          self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_error' })
          self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_url_save' })
          await storeQuestion(key, value, uploadUrl)
          return reject(err)
        })
    })
  }
}

function postQuestionData (ogrApiUrl, value, thingUUID, key, token) {
  self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_data' })
  const url = ogrApiUrl + '/ogr/question'
  const request = createQuestion(value.input, value.coords, key, thingUUID, value.anonymous, value.accepted)
  const config = createConfig('application/json', token)
  return new Promise(function (resolve, reject) {
    axios.post(url, request, config)
      .then((response) => {
        if (response.status === 200) {
          self.postMessage({ msg: 'update-anonymous-questions', anonymous: value.anonymous, id: response.data.id })
          return resolve(response)
        }
        return reject(Error('Request failed with status code: ' + response.status))
      })
      .catch((err) => {
        if (err.message === 'Request failed with status code 409') {
          self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_question_already_exists' })
          return resolve({ status: 409 })
        }
        self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_data_error' })
        return reject(err)
      })
  })
}

async function uploadQuestion (key, value, thingUUID, token, ogrApiUrl, iterationNumber) {
  try {
    self.postMessage({ msg: 'update-progress-info-number', info: 'sync_progress_upload_question_started', number: iterationNumber })
    const postQuestionDataResponse = await postQuestionData(ogrApiUrl, value, thingUUID, key, token)
    let uploadUrl = null
    if (postQuestionDataResponse.status === 200 || postQuestionDataResponse.status === 409) {
      if (postQuestionDataResponse.status === 200) {
        self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_data_success' })
        uploadUrl = postQuestionDataResponse.data.uploadUrl
      } else {
        self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_question_already_exists' })
        self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_question_deleted' })
        await localForage.removeItem(key)
        throw new Error('Question already exists.')
      }

      if (uploadUrl === null) {
        self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_url_invalid' })
        self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_question_deleted' })
        await localForage.removeItem(key)
        throw new Error('uploadurl is null')
      }

      if (value.files.images.length > 0) {
        self.postMessage({ msg: 'update-progress-info-number', info: 'sync_progress_found_images', number: value.files.images.length })
        const postImageDataResponse = await postImageData(uploadUrl, value, token, key, ogrApiUrl)
        if (postImageDataResponse.status === 200) {
          self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_images_success' })
        }
      } else {
        self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_question_deleted' })
        await localForage.removeItem(key)
      }
      self.postMessage({ msg: 'update-progress-info-number', info: 'sync_progress_upload_question_ended', number: iterationNumber })
    } else {
      self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_upload_data_no_success' })
    }
  } catch (err) {
    if (err.message === 'Request Error') {
      sendErrorReport(1, err, ogrApiUrl)
    } else if (err.message === 'Network Error') {
      sendErrorReport(2, err, ogrApiUrl)
    } else if (err.message === 'Unknown Error') {
      sendErrorReport(3, err, ogrApiUrl)
    } else {
      sendErrorReport(4, err, ogrApiUrl)
    }
  }
}

self.addEventListener('message', async (event) => {
  postMessage({ msg: 'update-progress-info', info: 'sync_progress_synchronization_started' })
  const keys = await localForage.keys()
  for (let i = 0; i < keys.length; i++) {
    const item = await localForage.getItem(keys[i])
    await uploadQuestion(keys[i], item, event.data.thingUUID, event.data.token, event.data.ogrApiUrl, i + 1)
  }
  self.postMessage({ msg: 'update-progress-info', info: 'sync_progress_synchronization_ended' })
  self.postMessage({ msg: 'sync-completed' })
})
