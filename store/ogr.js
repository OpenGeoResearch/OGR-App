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
export const state = () => ({
  filteredTags: [],
  category: undefined,
  selectedQuestion: undefined,
  questionIds: [],
  loader: false,
  seriesLayersVisible: false,
  selectedSeries: undefined
})

export const mutations = {

  Loader (state, payload) {
    state.loader = payload
  },

  resetFilters (state) {
    state.filteredTags = []
    state.category = undefined
    state.questionIds = []
    state.seriesLayersVisible = false
    state.selectedSeries = undefined
  },

  addTag (state, tag) {
    state.filteredTags.push(tag)
  },

  setTags (state, tags) {
    state.filteredTags = tags
  },

  removeTag (state, tag) {
    state.filteredTags = state.filteredTags.filter(item => item !== tag)
  },

  setCategory (state, categoryCode) {
    state.category = categoryCode
  },

  removeCategory (state) {
    state.category = undefined
  },

  setSelectedQuestion (state, question) {
    state.selectedQuestion = question
  },

  removeSelectedQuestion (state) {
    state.selectedQuestion = undefined
  },

  setQuestionIds (state, questionIds) {
    state.questionIds = questionIds
  },

  removeQuestionIds (state) {
    state.questionIds = []
  },

  getQuestionIds (state) {
    return state.questionIds
  },

  setSeriesLayersVisible (state, seriesLayersVisible) {
    state.seriesLayersVisible = seriesLayersVisible
  },

  setSelectedSeries (state, selectedSeries) {
    state.selectedSeries = selectedSeries
  }

}

export const actions = {}
