import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const {floor_id} = getQuery(event)

    if (!floor_id) {
        return {error: 'floor_id are required'}
    }

    const today = new Date().toISOString().slice(0, 10)

    try {
        const apartments = await client.request(readItems('student_accommodation_apartments_blocks', {
            fields: ['id', 'number', 'gender','number_of_rooms'],
            filter: {
                floor_id: {
                    _eq: floor_id
                }
            }
        }))

        if (!apartments || apartments.length === 0) return []

        const results = await Promise.all(
            apartments.map(async (apartment) => {
                const rooms = await client.request(readItems('student_accommodation_rooms', {
                    fields: ['id', 'max_capacity'],
                    filter: {
                        apartments_blocks_id: {
                            _eq: apartment.id
                        }
                    }
                }))

                if (!rooms) return null

                let totalFreeSlots = 0

                for (const room of rooms) {
                    const now = new Date().toISOString().split('T')[0]
                    const occupations = await client.request(readItems('student_accommodation_room_occupations', {
                        filter: {
                            room_id: {_eq: room.id},
                            _and: [
                                {start_date: {_lte: now}},
                                {
                                    _or: [
                                        {end_date: {_gte: now}},
                                        {end_date: {_null: true}},
                                    ],
                                },
                            ],
                        },
                        fields: ['id'],
                    }))
                    const occupiedCount = occupations?.length ?? 0
                    totalFreeSlots += (room.max_capacity || 0) - occupiedCount
                }
                return {
                    id: apartment.id,
                    number: apartment.number,
                    number_of_rooms: apartment.number_of_rooms,
                    gender: apartment.gender,
                    free_slots: totalFreeSlots,
                }
            })
        )

        return results.filter(Boolean)

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
