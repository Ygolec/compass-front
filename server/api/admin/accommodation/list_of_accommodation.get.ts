import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    try {
        const accommodations = await client.request(readItems('student_accommodation', {
            fields: ['*' +
            ',type.*'],
            filter: {
                status: {
                    _eq: 'not_fill'
                }
            }
        }))
        const accommodations_addresses = await client.request(readItems('student_accommodation_addresses', {
            fields: ['*'],
        }))
        const accommodations_with_addresses = accommodations.map(accommodation => {
            return {
                ...accommodation,
                addresses: accommodation.addresses.map(addressId => accommodations_addresses.find(address => address.id === addressId))
            };
        });
        return accommodations_with_addresses;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
