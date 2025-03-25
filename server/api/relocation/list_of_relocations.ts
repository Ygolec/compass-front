import {createDirectus, readItems, rest, staticToken, withToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    try {
        const result = await client.request(readItems('student_relocation', {
            fields: ['*'],
            status: {
                '_neq': 'no_display'
            }
        }))
        return result;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
