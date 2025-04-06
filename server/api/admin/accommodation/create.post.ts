import {createDirectus, createItem, rest, staticToken, updateItem} from "@directus/sdk";

interface SelectedAccommodation {
    accommodation_id: number
    address_id: number
    type_of_accommodation: string
}

interface Room {
    max_capacity: number
    room_number: number | string
}

interface Apartment {
    number: number | string
    gender: string
    number_of_rooms: number
    rooms: Room[]
}

interface Floor {
    number: number
    number_of_apartments: number
    apartments: Apartment[]
}

interface FloorCorridors {
    number: number
    number_of_rooms: number
    gender: string
    rooms: Room[]
}



interface RequestBody {
    selectedAccommodation: SelectedAccommodation
    contentOfAccommodations: {
        floors: Floor[]
    }
    contentOfAccommodationsCorridors:{
        floors: FloorCorridors[]
    }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const headers = getHeaders(event)
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const body = await readBody<RequestBody>(event)

    const {selectedAccommodation, contentOfAccommodations,contentOfAccommodationsCorridors} = body
    const {accommodation_id, address_id} = selectedAccommodation
    try {
        if (selectedAccommodation.type_of_accommodation === 'Квартирный' || selectedAccommodation.type_of_accommodation === 'Блочный') {
            for (const floor of contentOfAccommodations.floors) {
                // Создаём этаж.
                const createdFloor = await client.request(createItem('student_accommodation_floors', {
                    accommodation_id: accommodation_id,
                    floor_number: floor.number,
                    accommodation_address: address_id
                }))

                // ID только что созданной записи этажа.
                const floorId = createdFloor.id

                // Проходимся по апартаментам на этом этаже.
                for (const apartment of floor.apartments) {
                    // Создаём апартамент в блоках.
                    const createdApartmentBlock =
                        await client.request(createItem('student_accommodation_apartments_blocks', {
                            floor_id: floorId,
                            number: apartment.number,           // номер апартамента
                            gender: apartment.gender,           // пол ("М"/"Ж"/другой)
                            number_of_rooms: apartment.number_of_rooms
                        }))

                    // ID только что созданной записи апартамента.
                    const apartmentBlockId = createdApartmentBlock.id

                    // Проходимся по комнатам этого апартамента.
                    for (const room of apartment.rooms) {
                        await client.request(createItem('student_accommodation_rooms', {
                            floor_id: floorId,
                            apartments_blocks_id: apartmentBlockId,
                            max_capacity: room.max_capacity,
                            room_number: room.room_number
                        }))
                    }
                }
            }
        }

        if (selectedAccommodation.type_of_accommodation === 'Коридорный'){
            for (const floor of contentOfAccommodationsCorridors.floors) {
                // Создаём этаж.
                const createdFloor = await client.request(createItem('student_accommodation_floors', {
                    accommodation_id: accommodation_id,
                    floor_number: floor.number,
                    accommodation_address: address_id,
                    gender: floor.gender
                }))

                // ID только что созданной записи этажа.
                const floorId = createdFloor.id

                // Проходимся по комнатам на этом этаже.
                for (const room of floor.rooms) {
                    await client.request(createItem('student_accommodation_rooms', {
                        floor_id: floorId,
                        max_capacity: room.max_capacity,
                        room_number: room.room_number
                    }))
                }
            }
        }


        await client.request(updateItem('student_accommodation', accommodation_id, {
            status: 'fill_ended'
        }))

        // Возвращаем ответ об успехе.
        return {
            status: 'ok',
            message: 'Данные об общежитии успешно внесены'
        }
    } catch (error: any) {
        console.error('Ошибка при сохранении данных:', error)
        return {
            status: 'error',
            message: 'Ошибка при сохранении данных',
            detail: error.message || error.toString()
        }
    }
});