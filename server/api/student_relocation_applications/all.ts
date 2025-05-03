import {aggregate, createDirectus, readItems, rest, staticToken, withToken} from "@directus/sdk";
import {readBody} from "h3";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const body = await readBody(event);

    try {
        const count = await client.request(readItems('student_relocation_applications', {
            fields: ['id'],
            filter: {
                student_relocation_id: {
                    _eq: body.relocation_id
                },
                '_and': [
                    {
                        status: {
                            '_neq': 'canceled'
                        },
                    },
                    {
                        status: {
                            '_neq': 'rejected'
                        },
                    }
                ],
            }
        }))

        const result = await client.request(readItems('student_relocation_applications', {
            fields: ['*,' +
            'student_accommodation_to_address_id.*,' +
            'photos_of_room.*,student_accommodation_from_address_id.*,' +
            'student_accommodation_id_from.*,student_accommodation_id_to.*,' +
            'user_created.first_name,' +
            'user_created.id'],
            ...(body.limit && {limit: body.itemsPerPage}),
            ...(body.page && {page: body.page}),
            // ...(body.sortBy && { sort: ['sort',`-${body.sortBy}`] }),
            filter: {
                student_relocation_id: {
                    _eq: body.relocation_id
                },
                '_and': [
                    {
                        status: {
                            '_neq': 'canceled'
                        },
                    },
                    {
                        status: {
                            '_neq': 'rejected'
                        },
                    }
                ],
            }
        }))

        result.push({count: count.length});


        return result;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
