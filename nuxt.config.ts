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
        YANDEX_API_KEY: process.env.YANDEX_API_KEY || '',
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
    // },
    compatibilityDate: '2024-04-03',
    build: {
        transpile: ['vuetify'],
    },
    modules: [// другие модули...
        '@pinia/nuxt', 'nuxt-telegram-auth', 'vue-yandex-maps/nuxt'],
    yandexMaps: {
        apikey: process.env.YANDEX_API_KEY || '',
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