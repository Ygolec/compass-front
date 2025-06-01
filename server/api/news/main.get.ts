import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)

    const news = await client.request(readItems('news', {
        fields: ['id','title','date_created','sort','main_image'],
        filter: {
            "_and": [
                {
                    "is_visible": {
                        "_eq": true
                    }
                },
                {
                    "is_main": {
                        "_eq": true
                    }
                }
            ]
        }
    }))

    return news;

});
