import {
    createDirectus,
    createItem,
    deleteItem,
    readItems,
    rest,
    staticToken,
    updateItem,
    updateItems
} from "@directus/sdk";


export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const data = await readBody(event)
    if (!data.user_id) {
        return createError({
            statusCode: 400,
            message: 'user_id are required'
        })
    }

    try {
        const room_occupation_id = await client.request(readItems('student_accommodation_room_occupations', {
            filter: {
                user_id: {
                    _eq: data.user_id
                }
            }
        }))
        if (room_occupation_id.length) {
            const unlinkRoomOccupation = await client.request(deleteItem('student_accommodation_room_occupations', room_occupation_id[0].id))
            return {
                success: true,
                data: unlinkRoomOccupation
            }
        }
        throw createError({
            statusCode: 404,
            message: 'Room occupation not found'
        })

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

})