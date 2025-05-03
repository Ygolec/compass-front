import {createDirectus, createItem, readItems, rest, staticToken, updateItem} from "@directus/sdk";


export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const data = await readBody(event)

    if (!data.user_from_id || !data.room_id || !data.user_to_id) {
        return createError({
            statusCode: 400,
            message: 'user_from_id, room_id and user_to_id are required'
        })
    }

    try {
        const room_occupation_from = await client.request(readItems('student_accommodation_room_occupations', {
            filter: {
                user_id: {
                    _eq: data.user_from_id
                },
            },
            fields: ['*']
        }))


        const room_occupation_to = await client.request(readItems('student_accommodation_room_occupations', {
            filter: {
                user_id: {
                    _eq: data.user_to_id
                },
            },
            fields: ['*']
        }))

        if (room_occupation_from.length === 0) {
            return createError({
                statusCode: 400,
                message: 'user_from_id not found'
            })
        }
        if (room_occupation_to.length === 0) {
            return createError({
                statusCode: 400,
                message: 'user_to_id not found'
            })
        }
        const swapRoomOccupationFrom = await client.request(updateItem('student_accommodation_room_occupations', room_occupation_from[0].id, {
            room_id:room_occupation_to[0].room_id,
        }))
        const swapRoomOccupationTo = await client.request(updateItem('student_accommodation_room_occupations', room_occupation_to[0].id, {
            room_id:room_occupation_from[0].room_id,
        }))

        return {
            success: true,
        }
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

})