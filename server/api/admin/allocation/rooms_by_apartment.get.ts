import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const {apartment_id} = getQuery(event)

    if (!apartment_id) {
        return {error: 'apartment_id are required'}
    }



    try {
        const rooms = await client.request<Room[]>(
            readItems('student_accommodation_rooms', {
                fields: ['id', 'room_number', 'max_capacity'],
                filter: {
                    apartments_blocks_id: { _eq: apartment_id },
                },
            })
        )

        const roomIds = rooms.map((room) => room.id)

        if (roomIds.length === 0) return []
        if (!rooms || rooms.length === 0) return []

        const today = new Date().toISOString().split('T')[0]

        const occupations = await client.request<Occupation[]>(
            readItems('student_accommodation_room_occupations', {
                fields: ['room_id', 'end_date'],
                filter: {
                    room_id: { _in: roomIds },
                    _or: [
                        { end_date: { _null: true } },
                        { end_date: { _gte: today } },
                    ],
                },
            })
        )

        const occupiedMap: Record<number, number> = {}

        for (const occ of occupations) {
            occupiedMap[occ.room_id] = (occupiedMap[occ.room_id] || 0) + 1
        }

        // 3. Собираем итог
        const result = rooms.map((room) => ({
            id: room.id,
            room_number: room.room_number,
            max_capacity: room.max_capacity,
            free_places: room.max_capacity - (occupiedMap[room.id] || 0),
        }))

        return result
    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
