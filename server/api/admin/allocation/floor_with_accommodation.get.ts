import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const {accommodation_id, address_id} = getQuery(event)

    if (!accommodation_id || !address_id) {
        return {error: 'accommodation_id and addressId are required'}
    }

    try {
        const floors = await client.request(readItems('student_accommodation_floors', {
            fields: ['id', 'floor_number'],
            filter: {
                _and: [
                    {
                        accommodation_id: {
                            _eq: accommodation_id
                        }
                    },
                    {
                        accommodation_address: {
                            _eq: address_id
                        }
                    }
                ]
            }
        }))

        const result = []

        for (const floor of floors) {
            const floorId = floor.id
            const rooms_corridors = await client.request(readItems('student_accommodation_rooms', {
                fields: ['id', 'apartments_blocks_id', 'max_capacity'],
                filter: {
                    floor_id: {
                        _eq: floorId
                    }
                }
            }))

            const roomList = rooms_corridors
            const roomIds = roomList.map(r => r.id)
            const today = new Date().toISOString().slice(0, 10)
            let occupations = []

            if (roomIds.length > 0) {
                occupations = await client.request(readItems('student_accommodation_room_occupations', {
                    fields: ['room_id'],
                    filter: {
                        _and: [
                            {
                                room_id: {_in: roomIds},
                            },
                            {
                                start_date: {_lte: today},
                            },
                            {
                                _or: [
                                    {
                                        end_date: {_gte: today}
                                    },
                                    {
                                        end_date: {_null: true}
                                    }
                                ]
                            }
                        ]
                    }
                }))
            }

            const occupiedCountPerRoom: Record<number, number> = {}
            for (const occ of occupations || []) {
                const id = occ.room_id
                occupiedCountPerRoom[id] = (occupiedCountPerRoom[id] || 0) + 1
            }
            const uniqueApartments = new Set(roomList.map(r => r.apartments_blocks_id).filter(Boolean))
            const totalRooms = roomList.length
            const totalCapacity = roomList.reduce((acc, room) => acc + (room.max_capacity || 0), 0)
            const occupiedPlaces = roomList.reduce(
                (acc, room) => acc + (occupiedCountPerRoom[room.id] || 0),
                0
            )
            const freePlaces = totalCapacity - occupiedPlaces
            result.push({
                floor_id: floor.id,
                floor_number: floor.floor_number,
                apartments_count: uniqueApartments.size,
                rooms_count: totalRooms,
                free_places: freePlaces,
            })
        }

        return result;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
