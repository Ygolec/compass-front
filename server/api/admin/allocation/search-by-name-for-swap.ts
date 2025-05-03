import {createDirectus, readItems, readUsers, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const {q} = await readBody(event);

    if (!q) {
        return {error: 'q are required'}
    }
    try {
        const linkedUsers = await client.request(readItems('student_accommodation_room_occupations', {
            fields: ['user_id.id'],
        }));

        const filterConditions: any[] = [
            {
                full_name: {
                    _icontains: q
                }
            }
        ];

        if (linkedUsers.length > 0) {
            filterConditions.push({
                id: {
                    _in: linkedUsers.map((user) => user.user_id.id)
                }
            });
        }

        const users = await client.request(readUsers({
            fields: ['*'],
            filter: {
                "_and": filterConditions
            }
        }));

        return {
            success: true,
            data: users
        };
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
})