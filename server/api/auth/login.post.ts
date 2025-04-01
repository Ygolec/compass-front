import {defineEventHandler, readBody} from 'h3';
import {email_hse_student_check} from "~/utils/rules";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    console.log('Получен запрос на вход:', { email: body.email });

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 404,
            message: 'email и password обязательны.',
        });
    }

    const emailCheck = email_hse_student_check(body.email);
    if (emailCheck !== true) {
        throw createError({
            statusCode: 400,
            message: typeof emailCheck === 'string' ? emailCheck : 'Неверный формат email',
        });
    }

    try {
        console.log('Отправка запроса к бэкенду:', `${config.AUTH_BACKEND_URL}/api/v1/users/login`);
        
        const backendResponse = await fetch(`${config.AUTH_BACKEND_URL}/api/v1/users/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('Статус ответа от бэкенда:', backendResponse.status);

        // Получаем JSON-данные из ответа бэкенда
        const data = await backendResponse.json();
        console.log('Ответ от бэкенда:', data);

        if (!backendResponse.ok) {
            // Предположим, что бэкенд в случае ошибки возвращает JSON вида:
            // { "detail": "Email не найден." } или { "detail": "Неверный пароль." }
            const detail = data.detail || data.message || 'Неизвестная ошибка';

            console.error('Ошибка авторизации:', detail);

            // Сравниваем с нужными сообщениями
            if (detail.includes('Email не найден') || detail.includes('User not found')) {
                throw createError({
                    statusCode: 404,
                    message: 'Email не найден.',
                });
            } else if (detail.includes('Неверный пароль') || detail.includes('Invalid credentials')) {
                throw createError({
                    statusCode: 403,
                    message: 'Неверный пароль.',
                });
            } else if (detail.includes('Пользователь не подтвержден') || detail.includes('User not verified')) {
                throw createError({
                    statusCode: 401,
                    message: 'Пользователь не подтвержден.',
                });
            } else {
                // Если ошибка какая-то другая
                throw createError({
                    statusCode: backendResponse.status,
                    message: detail,
                });
            }
        }

        // Читаем Set-Cookie из заголовков бэкенда
        const setCookie = backendResponse.headers.get('set-cookie');
        if (setCookie) {
            // Устанавливаем cookie в ответ Nuxt-сервера
            event.node.res.setHeader('Set-Cookie', setCookie);
        }

        // Возвращаем тело ответа (JSON) обратно на фронтенд
        return data;
    } catch (error: any) {
        console.error('Ошибка при входе:', error);
        
        if (error.statusCode) {
            throw error; // Просто пробрасываем дальше
        }

        // Иначе это похоже на сетевую или другую непредвиденную ошибку
        throw createError({
            statusCode: 500,
            message: error.message || 'Ошибка при обращении к серверу авторизации',
            cause: error,
        });
    }
});