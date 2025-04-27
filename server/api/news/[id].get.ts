import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const id = event.context.params ? parseInt(event.context.params.id) as number : NaN
    const headers = getHeaders(event)

    const news = await client.request(readItems('news', {
        fields: ['id','title','date_created','sort','description'],
        filter: {
            "_and": [
                {
                    "is_visible": {
                        "_eq": true
                    }
                },
                {
                    "id": {
                        "_eq": id
                    }
                }
            ]
        }
    }))

    return news[0] || null;

});
