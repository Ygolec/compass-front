import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());
    const headers = getHeaders(event)

    const accommodation_with_points = await client.request(readItems('student_accommodation', {
        fields: ['id', 'name', 'addresses.coordinate,addresses.id'],
    }))

    return accommodation_with_points;

});
