import {createDirectus, readItem, readItems, rest, staticToken} from "@directus/sdk";


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)

    const user: user = await $fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: headers as HeadersInit
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    try {
        const student_relocation_applications = await client.request(readItems('student_relocation_applications', {
            fields: ['*'],
            filter:{
                '_and': [
                    {
                        user_created: {
                            '_eq': user.directus_id
                        },
                    },
                    {
                        student_relocation_id: {
                            '_eq': body.relocation_id
                        }
                    }
                ]
            }
        }))

        if (student_relocation_applications.length === 0) {
            throw createError({
                statusCode: 400,
                message: 'Application not found',
            })
        }

        const student_relocation_application: student_relocation_applications = student_relocation_applications[0];
        const student_relocation: any = await client.request(readItem('student_relocation', student_relocation_application.student_relocation_id));
        const student_accommodation_from: any = await client.request(readItem('student_accommodation', student_relocation_application.student_accommodation_id_from));
        const student_accommodation_to: any = await client.request(readItem('student_accommodation', student_relocation_application.student_accommodation_id_to));
        const student_accommodation_address_from: any = await client.request(readItem('student_accommodation_addresses', student_relocation_application.student_accommodation_from_address_id));
        const student_accommodation_address_to: any = await client.request(readItem('student_accommodation_addresses', student_relocation_application.student_accommodation_to_address_id));
        const student_relocation_applications_files = await client.request(readItems('student_relocation_applications_files', {
            fields: ['*'],
            filter: {
                '_and': [
                    {
                        student_relocation_applications_id: {
                            _eq: student_relocation_application.id
                        }
                    },
                    {
                        directus_files_id: {
                            '_neq': null
                        }
                    }
                ]
            }
        }));
        const student_relocation_application_with_data: student_relocation_application_with_data = {
            id: student_relocation_application.id,
            status: student_relocation_application.status,
            user_created: student_relocation_application.user_created,
            date_created: student_relocation_application.date_created,
            date_updated: student_relocation_application.date_updated,
            student_relocation: student_relocation,
            student_accommodation_from: student_accommodation_from,
            student_accommodation_to: student_accommodation_to,
            apartment_number: student_relocation_application.apartment_number,
            room_number: student_relocation_application.room_number,
            occupancy: student_relocation_application.occupancy,
            floor: student_relocation_application.floor,
            gender: 'none',
            telegram: student_relocation_application.telegram,
            phone_number: student_relocation_application.phone_number,
            student_accommodation_from_address: student_accommodation_address_from,
            student_accommodation_to_address: student_accommodation_address_to,
            photos_of_room: student_relocation_applications_files.map(file => file.directus_files_id),
        }
        return student_relocation_application_with_data;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
