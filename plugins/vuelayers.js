import Vue from 'vue'
import VueLayers from 'vuelayers'

import { findPointOnSurface } from 'vuelayers/dist/ol-ext'

Vue.use(VueLayers)

Vue.prototype.$findPointOnSurface = (geom) => {
  return findPointOnSurface(geom)
}
