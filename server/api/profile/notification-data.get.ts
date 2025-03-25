import {createDirectus, readItems, readUser, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)

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
        fields: ['is_get_notifications'],
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

    if (telegram_data.length>0){
        return {
            telegram: telegram_data[0],
        };
    } else {
        return {
            telegram: {
                is_get_notifications: null,
            },
        };
    }



});
