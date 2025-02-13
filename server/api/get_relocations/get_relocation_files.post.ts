import {aggregate, createDirectus, createItem, readItems, rest, staticToken, withToken} from "@directus/sdk";
import {readBody} from "h3";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const body = await readBody(event);


    const result = await client.request(readItems('student_relocation_applications_match', {
        fields: ['*.*.*'],
    }))


    return result;


});