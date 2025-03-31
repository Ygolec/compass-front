import {defineEventHandler, readBody, createError} from 'h3';
import {email_hse_student_check} from "~/utils/rules";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    console.log('Получен запрос на вход:', { email: body.email });

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Email и пароль обязательны',
        });
    }

    if (email_hse_student_check(body.email) !== true) {
        throw createError({
            statusCode: 400,
            message: email_hse_student_check(body.email),
        });
    }

    try {
        console.log('Отправка запроса к Directus:', `${config.DIRECTUS_URL}/auth/login`);
        
        const backendResponse = await fetch(`${config.DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: body.email,
                password: body.password
            }),
        });

        console.log('Статус ответа от Directus:', backendResponse.status);

        const data = await backendResponse.json();
        console.log('Ответ от Directus:', data);

        if (!backendResponse.ok) {
            const errorMessage = data.errors?.[0]?.message || data.message || 'Неизвестная ошибка';
            console.error('Ошибка авторизации:', errorMessage);

            if (errorMessage.includes('Invalid user credentials')) {
                throw createError({
                    statusCode: 401,
                    message: 'Неверный email или пароль',
                });
            } else if (errorMessage.includes('User not found')) {
                throw createError({
                    statusCode: 404,
                    message: 'Пользователь не найден',
                });
            } else if (errorMessage.includes('User not verified')) {
                throw createError({
                    statusCode: 401,
                    message: 'Пользователь не подтвержден',
                });
            } else {
                throw createError({
                    statusCode: backendResponse.status,
                    message: errorMessage,
                });
            }
        }

        // Проверяем наличие токенов в ответе
        if (!data.data?.access_token || !data.data?.refresh_token) {
            console.error('Отсутствуют токены в ответе:', data);
            throw createError({
                statusCode: 500,
                message: 'Ошибка при получении токенов',
            });
        }

        return {
            data: {
                access_token: data.data.access_token,
                refresh_token: data.data.refresh_token
            }
        };
    } catch (error: any) {
        console.error('Ошибка при входе:', error);
        
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: error.message || 'Ошибка при обращении к серверу авторизации',
        });
    }
});
