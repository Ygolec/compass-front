import {createDirectus, passwordReset, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    try {
        const result = await client.request(passwordReset(body.token, body.password));
    } catch (error: any) {
        console.error('Ошибка сброса пароля:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка сброса пароля',
        });
    }

    const payload = body.token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))
    const email = decodedPayload.email

    return {
        status: 200,
        body: {
            message: 'Пароль успешно изменен',
        },
    };


});
