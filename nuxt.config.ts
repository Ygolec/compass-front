import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig:{
        HSE_EMAIL: process.env.HSE_EMAIL,
        HSE_EMAIL_PASSWORD: process.env.HSE_EMAIL_PASSWORD,
        ENCRYPTION_KEY_FOR_HSE_TOKEN: process.env.ENCRYPTION_KEY_FOR_HSE_TOKEN,
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECTUS_URL: process.env.DIRECTUS_URL,
        DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN
    },
    compatibilityDate: '2024-04-03',
    build: {
        transpile: ['vuetify'],
    },
    modules: [// другие модули...
    '@pinia/nuxt', 'nuxt-telegram-auth'],
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