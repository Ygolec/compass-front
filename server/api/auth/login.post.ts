import {defineEventHandler, readBody} from 'h3';
import {email_hse_student_check} from "~/utils/rules";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 404,
            message: 'email и password обязательны.',
        });
    }

    if (email_hse_student_check(body.email) !== true) {
        throw createError({
            statusCode: 400,
            message: email_hse_student_check(body.email),
        });
    }


    try {
        const backendResponse = await fetch(`${config.public.AUTH_BACKEND_URL}/api/v1/users/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        // 3. Получаем JSON-данные из ответа бэкенда
        const data = await backendResponse.json()

        if (!backendResponse.ok) {
            // Предположим, что бэкенд в случае ошибки возвращает JSON вида:
            // { "detail": "Email не найден." } или { "detail": "Неверный пароль." }
            const detail = data.detail;

            // Сравниваем с нужными сообщениями
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
            }else if (detail === 'Пользователь не подтвержден.') {
                throw createError({
                    statusCode: 401,
                    message: 'Пользователь не подтвержден.',
                });
            }  else {
                // Если ошибка какая-то другая
                throw createError({
                    statusCode: backendResponse.status, // подставляем код ответа от бэкенда
                    message: detail || 'Неизвестная ошибка при авторизации',
                });
            }
        }

        // 4. Читаем Set-Cookie из заголовков бэкенда
        const setCookie = backendResponse.headers.get('set-cookie')
        if (setCookie) {
            // Устанавливаем cookie в ответ Nuxt-сервера
            // Благодаря этому на фронтенде у пользователя будет установлена кука
            event.node.res.setHeader('Set-Cookie', setCookie)
        }

        // 5. Возвращаем тело ответа (JSON) обратно на фронтенд
        return data
    } catch (error: any) {
        if (error.statusCode) {
            throw error; // Просто пробрасываем дальше
        }

        // Иначе это похоже на сетевую или другую непредвиденную ошибку
        throw createError({
            statusCode: 500,
            message: 'Ошибка при обращении к серверу авторизации',
            cause: error, // можем сохранить оригинальную ошибку
        });
    }
});
