import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

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
        const result = await client.request(readItems('student_relocation', {
            fields: ['*'],
            filter: {
                "_and": [
                    {
                        id: {
                            '_eq': id
                        }
                    },
                    {
                        status: {
                            '_neq': 'no_display'
                        }
                    }
                ]
            }
        }))
        return result;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }

})