import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig:{
        HSE_EMAIL: '',
        HSE_EMAIL_PASSWORD: '',
        ENCRYPTION_KEY_FOR_HSE_TOKEN: '',
        DATABASE_URL: '',
        DIRECTUS_URL: '',
        DIRECTUS_TOKEN: '',
        AUTH_BACKEND_URL: '',
    },
    compatibilityDate: '2024-04-03',
    build: {
        transpile: ['vuetify'],
    },
    modules: [// другие модули...
    '@pinia/nuxt'],
    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
        plugins: [
            vuetify({ autoImport: true })
        ]
    },
    devtools: {
      enabled: true,
      timeline: {
        enabled: true
      }
    }
});