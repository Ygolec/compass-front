import {createDirectus, readItems, readUser, rest, staticToken, updateItem} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)
    const body = await readBody(event);

    let user: user;

    try {
        user = await $fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: headers as HeadersInit
        });

    } catch (error: any) {
        console.error('Ошибка получения данных пользователя:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных пользователя',
        });
    }

    const telegram_data = await client.request(readItems('telegram_user_links', {
        fields: ['id'],
        filter: {
            _and: [
                {
                    user_id: {
                        '_eq': user.directus_id
                    }
                },
                {
                    status: {
                        '_eq': 'link'
                    }
                }
            ]
        }
    }));
    console.log(body.is_get_notifications);
    if (telegram_data.length > 0) {
        const update_telegram_notification = await client.request(updateItem('telegram_user_links', telegram_data[0].id, {
            is_get_notifications: body.is_get_notifications
        }));

        return {
            success: true,
        };
    } else {
        throw createError({
            statusCode: 404,
            message: 'Telegram user not found',
        });
    }
});
