import {
    createDirectus,
    createItem, createItems,
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
    if (!data.recommendations || !data.room_id) {
        return createError({
            statusCode: 400,
            message: 'recommendations and room_id are required'
        })
    }

    try {
        const updateRoomOccupation = await client.request(createItems('student_accommodation_room_occupations',
            data.recommendations.map(recommendation => ({
                user_id: recommendation.user_id.id,
                room_id: data.room_id,
            }))
        ))
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