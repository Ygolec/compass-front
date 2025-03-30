import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';

interface DirectusUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: {
        name: string;
    };
}

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig();

        // Проверяем наличие токена в куках
        const token = getCookie(event, 'auth_token');
        if (!token) {
            throw createError({
                statusCode: 401,
                message: 'Не авторизован'
            });
        }

        // Создаем клиент Directus
        const client = createDirectus(config.DIRECTUS_URL)
            .with(staticToken(config.DIRECTUS_TOKEN))
            .with(rest());

        // Получаем информацию о пользователе из Directus
        const users = await client.request(readItems('directus_users', {
            fields: ['id', 'first_name', 'last_name', 'email', 'role.name'],
            filter: {
                token: { _eq: token }
            }
        }));

        if (!users || users.length === 0) {
            throw createError({
                statusCode: 401,
                message: 'Пользователь не найден'
            });
        }

        const user = users[0];

        // Возвращаем данные в нужном формате
        return {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            directus_id: user.id,
            role: {
                name: user.role?.name
            }
        };
    } catch (error: any) {
        console.error('Ошибка при получении данных пользователя:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Ошибка при получении данных пользователя'
        });
    }
});
