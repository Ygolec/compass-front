import { defineEventHandler, createError } from 'h3';

interface DirectusUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface JWTPayload {
    id: string;
    email: string;
    role: string;
    app_access: boolean;
    admin_access: boolean;
    iat: number;
    exp: number;
    iss: string;
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const headers = getHeaders(event);
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({
            statusCode: 401,
            message: 'Не авторизован',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Получаем данные из JWT токена
        const [headerB64, payloadB64] = token.split('.');
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString()) as JWTPayload;
        console.log('Данные из JWT:', payload);

        // Проверяем наличие обязательных полей в токене
        if (!payload.id || !payload.email || !payload.role) {
            console.error('Некорректные данные в JWT токене:', payload);
            throw createError({
                statusCode: 401,
                message: 'Некорректный токен авторизации',
            });
        }

        // Получаем данные пользователя из Directus
        console.log('Запрос к Directus:', `${config.DIRECTUS_URL}/users/me`);
        
        const response = await fetch(`${config.DIRECTUS_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Статус ответа от Directus:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Ошибка от Directus:', errorData);
            throw createError({
                statusCode: response.status,
                message: errorData?.message || 'Ошибка при получении данных пользователя',
            });
        }

        const userData = await response.json();
        console.log('Полученные данные пользователя:', userData);

        // Проверяем, что ID пользователя в токене совпадает с ID в ответе Directus
        if (userData.data.id !== payload.id) {
            console.error('Несоответствие ID пользователя:', {
                tokenId: payload.id,
                directusId: userData.data.id
            });
            throw createError({
                statusCode: 401,
                message: 'Несоответствие данных пользователя',
            });
        }

        // Формируем объект пользователя
        const user = {
            id: userData.data.id,
            email: payload.email, // Используем email из токена
            name: `${userData.data.first_name || ''} ${userData.data.last_name || ''}`.trim() || payload.email,
            role: payload.role, // Используем роль из токена
            directus_id: userData.data.id
        };

        console.log('Подготовленные данные для клиента:', user);
        return user;
    } catch (error: any) {
        console.error('Ошибка при получении данных пользователя:', error);
        
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: error.message || 'Ошибка при получении данных пользователя',
        });
    }
});
