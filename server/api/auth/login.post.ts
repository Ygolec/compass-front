import {defineEventHandler, readBody} from 'h3';
import {email_hse_student_check} from "~/utils/rules";
import {createDirectus, readUsers, registerUser, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 404,
            message: 'email и password обязательны.',
        });
    }

    const emailCheckResult = email_hse_student_check(body.email);
    if (emailCheckResult !== true) {
        throw createError({
            statusCode: 400,
            message: typeof emailCheckResult === 'string' ? emailCheckResult : 'Некорректный email',
        });
    }


    try {
        const backendResponse = await fetch(`${config.AUTH_BACKEND_URL}/api/v1/users/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });


        const directus_user = await client.request(
            readUsers({
                fields: ['id', 'email', 'status'],
                filter: {
                    email: {
                        _eq: body.email as string,
                    },
                },
            })
        );

        if (directus_user.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'Пользователь не найден в системе Directus.',
            });
        }

        // 3. Получаем JSON-данные из ответа бэкенда
        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            const detail = data.detail;

            if (detail === 'Email не найден.') {
                throw createError({
                    statusCode: 404,
                    message: 'Email не найден.',
                });
            } else if (detail === 'Неверный пароль.') {
                throw createError({
                    statusCode: 403,
                    message: 'Неверный пароль.',
                });
            } else if (detail === 'Пользователь не подтвержден.') {
                throw createError({
                    statusCode: 401,
                    message: 'Пользователь не подтвержден.',
                });
            } else {
                throw createError({
                    statusCode: backendResponse.status,
                    message: detail || 'Неизвестная ошибка при авторизации',
                });
            }
        }


        const setCookie = backendResponse.headers.get('set-cookie');
        if (setCookie) {
            event.node.res.setHeader('Set-Cookie', setCookie);
        }

        return data;
    } catch (error: any) {

        if (error.message === 'Пользователь не подтвержден') {
            await client.request(registerUser(body.email,body.password))
        }

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Ошибка при обращении к серверу авторизации',
            cause: error,
        });
    }
});