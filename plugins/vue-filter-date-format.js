import Vue from 'vue'
import VueFilterDateFormat from '@vuejs-community/vue-filter-date-format'

Vue.use(VueFilterDateFormat, {
  monthNames: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]
})
