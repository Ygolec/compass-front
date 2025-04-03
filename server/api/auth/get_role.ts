import { createDirectus, rest, readUser } from '@directus/sdk';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);
    const directus_id = query.directus_id;

    if (!directus_id || typeof directus_id !== 'string') {
        throw createError({
            statusCode: 400,
            message: 'directus_id is required'
        });
    }

    if (!config.DIRECTUS_URL) {
        throw createError({
            statusCode: 500,
            message: 'DIRECTUS_URL is not configured'
        });
    }

    try {
        const client = createDirectus(config.DIRECTUS_URL).with(rest());
        const user = await client.request(readUser(directus_id));

        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'User not found'
            });
        }

        // Определяем роль
        const role = typeof user.role === 'string' ? user.role : user.role?.name;

        if (!role) {
            throw createError({
                statusCode: 404,
                message: 'Role not found'
            });
        }

        return { role };
    } catch (error) {
        console.error('Error fetching user role:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch user role'
        });
    }
}); 