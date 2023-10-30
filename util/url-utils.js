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

/* eslint-disable */
export { createQuestion, createFormData, createSingup, generateTimestamp }

function createSingup(singup, consent) {
  return new Singup(singup, consent).jsonString
}

function createFormData(files) {
  var bodyFormData = new FormData()
  var i
  for (i = 0; i < files.images.length; i++) {
    bodyFormData.append('files', files.images[i])
  }
  for (i = 0; i < files.audios.length; i++) {
    bodyFormData.append('files', files.audios[i])
  }
  for (i = 0; i < files.videos.length; i++) {
    bodyFormData.append('files', files.videos[i])
  }
  return bodyFormData
}

function createQuestion(input, coords, questionUUID, thingUUID, anonymous, consent) {
  if (input.category === undefined) {
    input.category = { id: 0 }
  }
  if (input.description === '') {
    input.description = 'Keine Beschreibung vorhanden.'
  }
  if (input.tags.length < 1) {
    input.tags = ["untagged"]
  }
  return new Question(input, coords, questionUUID, thingUUID, anonymous, consent).jsonString
}

function generateTimestamp() {
  const now = new Date()
  const year = '' + now.getUTCFullYear()
  const month = '' +  (now.getUTCMonth() < 9 ? '0' : '') + (now.getUTCMonth() + 1)
  const day = '' +  (now.getUTCDate() < 10 ? '0' : '') + now.getUTCDate()
  const hour = '' +  (now.getUTCHours() < 10 ? '0' : '') + now.getUTCHours()
  const minutes = '' +  (now.getUTCMinutes() < 10 ? '0' : '') + now.getUTCMinutes()
  const seconds = '' +  (now.getUTCSeconds() < 10 ? '0' : '') + now.getUTCSeconds()

  return year + '-' + month + '-' + day + 'T' + hour + ':' + minutes + ':' + seconds + 'Z'
}

class Question {
  constructor(input, coords, questionUUID, thingUUID, anonymous, consent) {
    this.json = {
      "question": input.question,
      "description": input.description,
      "tags": input.tags,
      "category": input.category.id,
      "geometry": {
        "coordinates": coords,
        "type": "Point"
      },
      "media": {
        "images": input.media.images,
        "audios": input.media.audios,
        "videos": input.media.videos
      },
      "thingUUID": thingUUID,
      "questionUUID": questionUUID,
      "anonymous": anonymous,
      "accepted": consent
    }
  }
  get jsonString() {
    return JSON.stringify(this.json)
  }
}

class Singup {
  constructor(singup, consent) {
    this.json = {
    "username": singup.username,
    "email": singup.email,
    "password": singup.password,
    "thingUUID": singup.thingUUID,
    "accepted": consent
    }
  }
  get jsonString() {
    return JSON.stringify(this.json)
  }
}
