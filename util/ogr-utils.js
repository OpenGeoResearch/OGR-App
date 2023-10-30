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
import de_categories from '@/static/de_categories.json'
import en_categories from '@/static/en_categories.json'

import { bbox } from 'ol/loadingstrategy'
// Circle, Fill and Stroke currently not in use
import { Text, Style, Icon, Fill, Stroke } from 'ol/style'

export function initLayerConfig (layer, zIdx) {
  if (!('zIndex' in layer)) layer.zIndex = zIdx
  if (!('visible' in layer)) layer.visible = true
  if (!('selectable' in layer)) layer.selectable = false
  if (!('opacity' in layer)) layer.opacity = 1

  // generate style factory
  if ('style' in layer) {
    for (let j = 0; j < layer.style.length; j++) {
      if (layer.style[j].cmp === 'vl-style-func') {
        createStyleFunc(layer.style[j])
      }
    }
  }
}

export function createSTASource (source) {
  const StaUrl = source.url

  source.url = function (extent, resolution, projection) {
    let url = StaUrl
    // Filter for question IDs or Filter for extent
    if (window.$nuxt.$store.state.ogr.questionIds.length > 0) {
      url = url + '?$filter=('
      for (const questionId of window.$nuxt.$store.state.ogr.questionIds) {
        url = url + 'id eq ' + questionId + ' or '
      }
      url = url.substring(0, url.length - 3)
      url = url + ')'
    } else {
      if (extent[0] === -Infinity) {
        extent = [-180, -90, 180, 90]
      }
      // Add extent filter
      const polygon = 'POLYGON ((' + extent[0] + ' ' + extent[1] +
        ',' + extent[0] + ' ' + extent[3] +
        ',' + extent[2] + ' ' + extent[3] +
        ',' + extent[2] + ' ' + extent[1] +
        ',' + extent[0] + ' ' + extent[1] +
        '))'
      url = url + "?$filter=geo.intersects(observedArea, geography'" + polygon + "')"
    }
    // add filter for not-in-series and series-parent and series-parent-exam
    url = url + ' and (properties/series-state eq \'not-in-series\' or properties/series-state eq \'series-parent\' or properties/series-state eq \'series-parent-exam\')'

    // add tag filters
    if (window.$nuxt.$store.state.ogr.filteredTags.length > 0) {
      url = url + ' and ('
      for (const filter of window.$nuxt.$store.state.ogr.filteredTags) {
        url = url + "Datastreams/Observations/result eq '" + filter + "' or "
      }
      url = url.substring(0, url.length - 3)
      url = url + ')'
    }

    // add category filter
    if (window.$nuxt.$store.state.ogr.category !== undefined) {
      url = url + ' and ('
      url = url + ' startswith(unitOfMeasurement/symbol, ' + window.$nuxt.$store.state.ogr.category + ')'
      url = url + ')'
    }

    // add max. number of features and format
    url = url + '&$top=1000&$resultFormat=geojson'

    return url
  }

  // Custom loading strategy. Load if filter changes or bbox
  source.loadingStrategyFactory = bbox

  source.type = 'sta'
  source.cmp = 'vl-source-vector'
  return source
}

export function createSTASeriesSource (source) {
  const StaUrl = source.url

  source.url = function (extent, resolution, projection) {
    let url = StaUrl
    // Filter for question IDs or Filter for extent
    if (window.$nuxt.$store.state.ogr.questionIds.length > 0) {
      url = url + '?$filter=('
      for (const questionId of window.$nuxt.$store.state.ogr.questionIds) {
        url = url + 'id eq ' + questionId + ' or '
      }
      url = url.substring(0, url.length - 3)
      url = url + ')'
    } else {
      if (extent[0] === -Infinity) {
        extent = [-180, -90, 180, 90]
      }
      // Add extent filter
      const polygon = 'POLYGON ((' + extent[0] + ' ' + extent[1] +
        ',' + extent[0] + ' ' + extent[3] +
        ',' + extent[2] + ' ' + extent[3] +
        ',' + extent[2] + ' ' + extent[1] +
        ',' + extent[0] + ' ' + extent[1] +
        '))'
      url = url + "?$filter=geo.intersects(observedArea, geography'" + polygon + "')"
    }
    // add filter for series-child
    url = url + ' and (properties/series-state eq \'series-child\')'

    // add tag filters
    if (window.$nuxt.$store.state.ogr.filteredTags.length > 0) {
      url = url + ' and ('
      for (const filter of window.$nuxt.$store.state.ogr.filteredTags) {
        url = url + "Datastreams/Observations/result eq '" + filter + "' or "
      }
      url = url.substring(0, url.length - 3)
      url = url + ')'
    }

    // add category filter
    if (window.$nuxt.$store.state.ogr.category !== undefined) {
      url = url + ' and ('
      url = url + ' startswith(unitOfMeasurement/symbol, ' + window.$nuxt.$store.state.ogr.category + ')'
      url = url + ')'
    }

    // add max. number of features and format
    url = url + '&$top=1000&$resultFormat=geojson'

    return url
  }

  // Custom loading strategy. Load if filter changes or bbox
  source.loadingStrategyFactory = bbox

  source.type = 'sta'
  source.cmp = 'vl-source-vector'
  return source
}

export function createStyleFunc (style) {
  style.func = function (feature) {
    const baseStyle = new Style({
      fill: createFillStyle(style, feature),
      stroke: createStrokeStyle(style, feature),
      image: createImageStyle(style, feature),
      text: createTextStyle(style, feature)
    })
    return [
      baseStyle
    ]
  }
  return style
}


function createFillStyle (style, feature) {
  if ('fill' in style.config) {
    return new Fill(style.config.fill);
  } else {
    return undefined
  }
}

function createStrokeStyle (style, feature) {
  if ('stroke' in style.config) {
    return new Stroke(style.config.stroke);
  } else {
    return undefined
  }
}

function createImageStyle (style, feature) {
  if ('image' in style.config) {
    if ('icon' in style.config.image) {
      return new Icon(createStyleOptions(style.config.image.icon, feature))
    }
  } else {
    return undefined
  }
}

function createTextStyle (style, feature) {
  if ('text' in style.config) {
    return new Text(createStyleOptions(style.config.text, feature))
  } else {
    return undefined
  }
}

function createStyleOptions (styleOptions, feature) {
  const options = {}
  Object.keys(styleOptions)
    .forEach(key => {
      if (key.startsWith(':')) {
        if (styleOptions[key] === '$size') {
          options[key.substring(1)] = feature.get('features').length.toString()
        } else {
          options[key.substring(1)] = feature.get(styleOptions[key])
        }
      } else {
        options[key] = styleOptions[key]
      }
    })
  return options
}


export function topCategoriesList (topCategories, lang) {
  const topCategoriesList = []
  topCategories.forEach(category => {
    topCategoriesList.push({
      code: category[0],
      name: getCategoryFromCode(category[0], lang),
      count: category[1]
    })
  })
  return topCategoriesList
}

export function calculateTopHierarchicalCategories (topCategoriesList, lang) {
  const topCategoriesTmp = topCategoriesList.slice().sort((a, b) => {
    return (a.code > b.code) ? -1 : 1
  })
  const topCategoriesName = {}
  topCategoriesTmp.forEach(category => {
    let tmpCode = category.code

    function handleCategory (code, count) {
      if (code in topCategoriesName) {
        topCategoriesName[code].count += count
      } else {
        topCategoriesName[code] = {
          code: code,
          name: getCategoryFromCode(code, lang),
          count: count
        }
      }
    }

    while (tmpCode.length > 0) {
      handleCategory(tmpCode, category.count)
      if (tmpCode.length === 1) {
        tmpCode = ''
      } else if (tmpCode.length === 3) {
        tmpCode = tmpCode.substring(0, 1)
      } else if (tmpCode.length === 4) {
        tmpCode = tmpCode.substring(0, 3)
      } else if (tmpCode.length === 6) {
        tmpCode = tmpCode.substring(0, 4)
      }
    }
  })
  return Object.values(topCategoriesName).sort((a, b) => {
    return (a.count > b.count) ? -1 : 1
  })
}

export function getCategoryFromCode (code, lang) {
  if (isNaN(code)) { return 'Unknown' }

  let categories = en_categories
  if (lang === 'de') {
    categories = de_categories
  }

  let tmpCode = code
  let category = undefined

  let i = 1
  while (tmpCode.length > 0) {
    let lvlCodeIdx = 0
    if (i === 1) {
      lvlCodeIdx = parseInt(tmpCode[0])
      category = (category === undefined) ? categories[lvlCodeIdx] : category[lvlCodeIdx]
      tmpCode = tmpCode.substring(1)
    } else if (i === 4) {
      lvlCodeIdx = parseInt(tmpCode[0])
      if (lvlCodeIdx !== 0) { lvlCodeIdx -= 1 }
      category = category.children[lvlCodeIdx]
      tmpCode = tmpCode.substring(1)
    } else {
      lvlCodeIdx = parseInt(tmpCode.substring(0, 2)) - 1
      category = category.children[lvlCodeIdx]
      tmpCode = tmpCode.substring(2)
      i++
    }
    i++
  }
  let placeholder = 'Unknown category'
  if (lang === 'de') {
    placeholder = 'Unbekannte Kategorie'
  }
  return (category !== undefined) ? category.label : placeholder
}

// Converts links inside inputText into a html attribute and makes it clickable
export function linkify (inputText, baseUrl) {
  const pattern0 = new RegExp(baseUrl + '\\/question\\/', 'g')
  let text = inputText.replace(pattern0, '/question/')

  const pattern1 = /\/question\/([0-9]*)/gim
  text = text.replace(pattern1, '<b>Frage $1</b>')

  const pattern2 = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;()]*[-A-Z0-9+&@#/%=~_|])/gim

  text = text.replace(pattern2, '<a href="/external/$1" target="_blank">$1</a>')

  const pattern3 = /(^|[^/])(www\.[\S]+(\b|$))/gim
  text = text.replace(pattern3, '$1<a href="/external/$2" target="_blank">$2</a>')

  return text
}
