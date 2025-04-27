import {createDirectus, createItem, rest, staticToken} from "@directus/sdk";


export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const data = await readBody(event)
    if (!data.user_id || !data.room_id) {
        return createError({
            statusCode: 400,
            message: 'user_id and room_id are required'
        })
    }

    try {
        const updateRoomOccupation = await client.request(createItem('student_accommodation_room_occupations', {
            user_id: data.user_id,
            room_id: data.room_id,
        }))
        return {
            success: true,
            data: updateRoomOccupation
        }
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

})