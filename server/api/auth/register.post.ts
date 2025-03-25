import {defineEventHandler, readBody} from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const {email, password} = await readBody(event);

    if (!email || !password) {
        throw createError({
            statusCode: 404,
            message: 'email и пароль обязательны',
        })
    }

    try {
        // Отправляем запрос на внешний сервер
        const response = await $fetch(`${config.AUTH_BACKEND_URL}/api/v1/users/register`, {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });


    } catch (error: any) {
        const errorMessage = error.data?.detail || error.response?._data?.detail;

        if (errorMessage === 'Email уже существует.') {
            throw createError({
                statusCode: 404,
                message: 'Такой email существует',
            })
        }


        throw createError({
            statusCode: 404,
            message: errorMessage,
        })
    }

    return {
        status: 'success',
    };

});
