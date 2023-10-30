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
import serveStatic from 'serve-static'
import colors from './assets/colors'

export default {
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  ssr: false,
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    titleTemplate: '%s - ' + 'OGR-PWA',
    title: 'OpenGeoResearch' || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  router: {
    extendRoutes (routes, resolve) {
      routes.push(
        {
          path: '/external/:link(.*)*',
          component: resolve(__dirname, 'pages/external/_link/index.vue')
        }
      )
    }
  },
  /*
  ** Global CSS
  */
  css: [
    // possible way to serve font as asset
    // '~/assets/fonts/roboto.css',
    // '~/assets/css/styles.css'
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [{
    src: '@/plugins/vuelayers.js',
    ssr: false
  }, {
    src: '@/plugins/localforage.js',
    ssr: false
  }, {
    src: '~/plugins/vue-filter-date-format',
    ssr: false
  }, {
    src: '~/plugins/vue-filter-date-parse',
    ssr: false
  }, {
    src: '~/plugins/vue-treeselect.js',
    ssr: false
  }, {
    src: '~/plugins/navigation.js',
    ssr: false
  }, {
    src: '@/plugins/ol.js',
    ssr: false
  }, {
    src: '~/plugins/inject-ww',
    ssr: false
  }
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
    '@nuxtjs/pwa',
    '@nuxtjs/auth',
    '@nuxtjs/i18n',
    '@nuxtjs/axios',
    '@nuxtjs/apollo'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@/modules/vuelayers'
  ],
  pwa: {
    manifest: {
      lang: 'de',
      short_name: 'OpenGeoResearch',
      name: 'OpenGeoResearch',
      start_url: '/home',
      display: 'standalone',
      theme_color: colors.green.base
    },
    workbox: {
      globPatterns: ['**/*.{js,css}', '**/static/*'],
      offlinePage: '/offline.html'
    }
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: 'https://localhost:8080'
  },
  apollo: {
    clientConfigs: {
      default: '~/apollo.config.js'
    },
    includeNodeModules: true
  },
  /*
  ** localforage module configuration
  ** See https://github.com/nuxt-community/localforage-module
  */
  localforage: {
    /* module options */
  },
  auth: {
    strategies: {
      local: {
        token: {
          property: 'accessToken'
        },
        endpoints: {
          login: { url: '/ogr/auth/login', method: 'post', propertyName: 'accessToken' },
          logout: false,
          user: { url: '/ogr/auth/user', method: 'get', propertyName: false }
        }
      }
    },
    redirect: {
      login: false,
      logout: false,
      home: false,
      callback: false
    }
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    defaultAssets: false,
    font: {
      family: 'Roboto'
    },
    icons: {
      iconfont: 'mdiSvg'
    },
    theme: {
      dark: false,
      themes: {
        light: {
          // standard colors
          primary: colors.green.base,
          accent: colors.red.base,
          secondary: colors.lightGreen.base,
          tertiary: colors.purple.base,
          info: colors.brown.base,
          warning: colors.red.base,
          error: colors.purple.base,
          success: colors.green.base,
          // custom colors
          placeholder: colors.grey.base,
          highlight: colors.lightGreen.lighten2,
          external: colors.lightGreen.lighten2,
          caution: colors.purple.lighten3,
          positive: colors.lightGreen.lighten1,
          negative: colors.red.lighten2,
          neutral: colors.grey.darken2,
          background: colors.grey.lighten2,
          accentLight: colors.red.lighten2,
          infoLight: colors.brown.lighten1
        },
        dark: {
          // standard colors
          primary: colors.green.darken1,
          accent: colors.red.darken2,
          secondary: colors.lightGreen.darken2,
          tertiary: colors.purple.lighten1,
          info: colors.brown.lighten1,
          warning: colors.red.darken2,
          error: colors.purple.lighten1,
          success: colors.green.darken2,
          // custom colors
          placeholder: colors.grey.base,
          highlight: colors.lightGreen.lighten2,
          external: colors.red.darken2,
          caution: colors.purple.lighten3,
          positive: colors.lightGreen.lighten1,
          negative: colors.red.lighten2,
          neutral: colors.grey.darken1,
          background: colors.grey.base,
          accentLight: colors.red.lighten2,
          infoLight: colors.brown.lighten1
        }
      }
    }
  },
  i18n: {
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    locales: [{
      code: 'en',
      name: 'English',
      iso: 'en-US',
      file: 'en.json'
    }, {
      code: 'de',
      name: 'Deutsch',
      iso: 'de-DE',
      file: 'de.json'
    }],
    defaultLocale: 'de',
    fallbackLocale: 'de'
  },
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    transpile: ['vuelayers', 'ol'],
    extractCSS: true,
    extend (config, { isDev, isClient }) {
      config.output.globalObject = 'this'

      if (isClient) {
        config.module.rules.push({
          test: /\.worker\.js$/,
          loader: 'worker-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  publicRuntimeConfig: {
    ogrPwaUrl: process.env.OGR_PWA_URL || 'https://localhost:8080',
    ogrApiUrl: process.env.OGR_API_URL || 'https://localhost:8080',
    ogrStaUrl: process.env.OGR_STA_URL || 'https://localhost:8080',
    ogrMapUrl: process.env.OGR_MAP_URL || 'https://localhost:8080',
    ogrWebUrl: process.env.OGR_WEB_URL || 'https://localhost:8080',
    wsjUrl: process.env.WSJ_URL || 'https://www.wissenschaftsjahr.de',
    secretForClaim: process.env.OGR_CLAIM_SECRET || 'ChangeMe',
    ogrSupportMail: process.env.OGR_SUPPORT_MAIL || 'ChangeMe',
    ogrPwaVersion: process.env.OGR_PWA_VERSION || 'ChangeMe',
    axios: {
      baseURL: process.env.OGR_API_URL
    },
    auth: {
      strategies: {
        local: {
          login: process.env.OGR_API_URL + '/ogr/auth/login'
        }
      }
    }
  },
  serverMiddleware: [
    { path: '/.well-known/assetlinks.json', handler: serveStatic('./assets/assetlinks.json') },
    {
      path: '/.well-known/apple-app-site-association',
      handler: serveStatic('./assets/apple-app-site-association.json')
    }
  ]
}
