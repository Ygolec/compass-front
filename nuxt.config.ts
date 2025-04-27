import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify';
import {process} from "std-env";


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        HSE_EMAIL: '',
        HSE_EMAIL_PASSWORD: '',
        ENCRYPTION_KEY_FOR_HSE_TOKEN: '',
        DATABASE_URL: '',
        DIRECTUS_URL: '',
        DIRECTUS_TOKEN: '',
        AUTH_BACKEND_URL: '',
        TELEGRAM_TOKEN: '',
        REC_URL: '',
    },
    // runtimeConfig: {
    //     HSE_EMAIL: process.env.HSE_EMAIL,
    //     HSE_EMAIL_PASSWORD: process.env.HSE_EMAIL_PASSWORD,
    //     ENCRYPTION_KEY_FOR_HSE_TOKEN: process.env.ENCRYPTION_KEY_FOR_HSE_TOKEN,
    //     DATABASE_URL: process.env.DATABASE_URL,
    //     DIRECTUS_URL: process.env.DIRECTUS_URL,
    //     DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,
    //     AUTH_BACKEND_URL: process.env.AUTH_BACKEND_URL,
    //     TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    //     YANDEX_API_KEY: process.env.YANDEX_API_KEY,
    //     REC_URL: process.env.REC_URL,
    // },
    compatibilityDate: '2024-04-03',
    build: {
        transpile: ['vuetify'],
    },
    modules: [// другие модули...
        '@pinia/nuxt', 'nuxt-telegram-auth', 'vue-yandex-maps/nuxt'],
    yandexMaps: {
        apikey: 'e1a6fad9-632c-4ed2-9f20-dd0cc990c444',
    },
    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
        plugins: [
            vuetify({autoImport: true})
        ]
    },
    devtools: {
        enabled: true,
        timeline: {
            enabled: true
        }
    }
});