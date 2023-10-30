import Vue from 'vue'
import VueLocalforage from 'v-localforage'

Vue.use(VueLocalforage, {
  instances: [
    {
      storeName: 'cache'
    },
    {
      storeName: 'storage'
    }
  ]
})
