import {createDirectus, readItem, readItems, readUser, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const id = event.context.params ? parseInt(event.context.params.id) as number : NaN
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    if (!Number.isInteger(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID should be an integer',
        })
    }

    try {
        const result = await client.request(readItem('student_relocation_applications',id, {
            fields: ['*' +
            ',student_accommodation_id_from.*' +
            ',student_accommodation_id_to.*' +
            ',student_accommodation_from_address_id.*' +
            ',student_accommodation_to_address_id.*' +
            ',photos_of_room.*'
            ],
            filter: {
                "_or": [
                    {
                        status: {
                            '_neq': 'rejected'
                        }
                    },
                    {
                        status: {
                            '_neq': 'canceled'
                        }
                    }
                ]
            }
        }))

        const user = await client.request(readUser(result.user_created, {
            fields:['id','first_name','last_name','email']
        }))

        result.user_created = user


        return result;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

})