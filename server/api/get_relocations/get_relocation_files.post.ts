import {aggregate, createDirectus, createItem, readItems, rest, staticToken, withToken} from "@directus/sdk";
import {readBody} from "h3";

interface User {
    role?: string;
    directus_id?: string;
}

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig();
        const body = await readBody(event);
        
        // Проверяем наличие необходимых переменных окружения
        if (!config.DIRECTUS_URL || !config.DIRECTUS_TOKEN) {
            throw createError({
                statusCode: 500,
                message: 'Отсутствуют необходимые переменные окружения для Directus'
            });
        }

        // Создаем клиент Directus
        const client = createDirectus(config.DIRECTUS_URL)
            .with(staticToken(config.DIRECTUS_TOKEN))
            .with(rest());

        // Получаем информацию о текущем пользователе из /api/auth/me
        const authUser = await $fetch<{ directus_id: string }>('/api/auth/me', {
            method: 'GET',
            query: {
                access_token: body.access_token
            }
        });

        if (!authUser?.directus_id) {
            throw createError({
                statusCode: 401,
                message: 'Пользователь не авторизован'
            });
        }

        // Получаем информацию о пользователе из Directus
        const directusUser = await client.request(readItems('directus_users', {
            fields: ['role.name', 'first_name', 'last_name', 'email'],
            filter: {
                id: { _eq: authUser.directus_id }
            }
        }));

        if (!directusUser || !directusUser.length) {
            throw createError({
                statusCode: 404,
                message: 'Пользователь не найден в Directus'
            });
        }

        // Проверяем роль пользователя
        const userRole = directusUser[0].role?.name;
        const allowedRoles = ['admin', 'manager', 'coordinator'];
        
        if (!userRole || !allowedRoles.includes(userRole)) {
            throw createError({
                statusCode: 403,
                message: 'У вас нет прав для получения файлов переселения'
            });
        }

        // Получаем данные о релокациях
        const result = await client.request(readItems('student_relocation_applications_match', {
            fields: ['*.*.*'],
        }));

        return result;
    } catch (error: any) {
        console.error('Ошибка при получении данных релокации:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Произошла ошибка при получении данных релокации'
        });
    }
});