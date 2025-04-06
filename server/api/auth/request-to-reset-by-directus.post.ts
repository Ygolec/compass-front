import {createDirectus, passwordRequest, readUsers, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    const user = await client.request(readUsers({
        filter: {
            email: {
                _eq: body.email,
            },
        },
        fields: ['id'],
    }));

    if (user.length === 0) {
        throw createError({
            statusCode: 404,
            message: 'Пользователь не найден',
        });
    }

    try {
        const result = await client.request(passwordRequest(body.email, config.DIRECTUS_PASSWORD_RESET_URL));
    } catch (error: any) {
        console.error('Ошибка отправки запроса на сброс пароля:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка отправки запроса на сброс пароля',
        });
    }
});
