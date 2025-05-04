import {createDirectus, readItems, rest, staticToken} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    try {
        const accommodations = await client.request(readItems('student_accommodation', {
            fields: ['*', 'type.*']
        }));

        const accommodations_addresses = await client.request(readItems('student_accommodation_addresses', {
            fields: ['*'],
            filter: {
                status: {
                    _eq: 'not_filled'
                }
            }
        }));

        const accommodations_with_addresses = accommodations
            .map(accommodation => {
                const addresses = accommodation.addresses.map(addressId =>
                    accommodations_addresses.find(address => address.id === addressId)
                ).filter(Boolean);

                if (addresses.length > 0) {
                    return {
                        ...accommodation,
                        addresses
                    };
                }

                return null;
            })
            .filter(Boolean);

        return accommodations_with_addresses;

    } catch (error: any) {
        console.error('Ошибка получения данных:', error);
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Ошибка получения данных',
        });
    }
});
