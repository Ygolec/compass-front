import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig:{
        HSE_EMAIL: process.env.HSE_EMAIL,
        HSE_EMAIL_PASSWORD: process.env.HSE_EMAIL_PASSWORD,
        ENCRYPTION_KEY_FOR_HSE_TOKEN: process.env.ENCRYPTION_KEY_FOR_HSE_TOKEN,
        DATABASE_URL: process.env.DATABASE_URL
    },
    compatibilityDate: '2024-04-03',
    build: {
        transpile: ['vuetify'],
    },
    modules: [
        '@pinia/nuxt',
        // другие модули...
    ],
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
    devtools: { enabled: true }
});