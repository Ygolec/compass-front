import {createDirectus, readItem, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const {questionnaire_id} = getQuery(event)

    if (!questionnaire_id) {
        createError({
            statusCode: 400,
            message: 'questionnaire_id are required'
        })
    }


    try {
        if (questionnaire_id) {
            const questionnaire = await client.request(
                readItem('questionnaires', questionnaire_id.toString())
            )

            if (questionnaire.length === 0) {
                createError({
                    statusCode: 404,
                    message: 'Questionnaire not found'
                })
            }
            return questionnaire
        }

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
