import {createDirectus, readUser, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)

    let user: user;

    try {
        user = await $fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: headers as HeadersInit
        });

    } catch (error: any) {
        console.error('Ошибка получения данных пользователя:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных пользователя',
        });
    }

    const contactData = await client.request(readUser(user.directus_id, {
        fields: ['first_name', 'last_name', 'middle_name', 'email', 'birth_date']
    }));

    return contactData;

});
