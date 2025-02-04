import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function decryptString(encryptedString: string, secretKey: string): string {
    const [ivHex, encryptedHex] = encryptedString.split(':');
    if (!ivHex || !encryptedHex) {
        throw new Error('Некорректный формат зашифрованной строки');
    }
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function updateToken() {
    const updateResponse = await $fetch('/api/hse_api/update_token');
    if (!updateResponse || !('success' in updateResponse)) {
        throw new Error('Ошибка обновления токена');
    }
}

async function searchData(q: string, token: string, headers: any) {
    const apiUrl = `https://api.hseapp.ru/v3/dump/search?q=${encodeURIComponent(q)}`;
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
        throw new Error('Ошибка запроса поиска');
    }

    const dataFromHse = await response.json();
    return dataFromHse.filter((item: any) => item.type !== 'GROUP');
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const { q } = await readBody(event);
    const encryptionKey = config.ENCRYPTION_KEY_FOR_HSE_TOKEN;

    const tokenFromDb = (await prisma.token_for_search.findUnique({
        where: { id: 1 },
        select: { token: true },
    })) || { token: '' };

    const token = decryptString(tokenFromDb.token, encryptionKey);
    const headers = {
        "x-android-build": "97910",
        "authorization": "Bearer " + token,
        "accept-language": "ru-RU",
        "user-agent": "HSE App X/1.34.1; release (Pixel 7 Pro; Android/15; ru_RU; 1080x2340)",
        "accept-encoding": "gzip",
    };

    try {
        return { success: true, data: await searchData(q, token, headers) };
    } catch (error: any) {
        if (error.message === 'Ошибка запроса поиска') {
            // Помечаем токен как неактивный
            await prisma.is_active_token_for_search.update({
                where: { id: 1 },
                data: { is_active: false },
            });

            // Обновляем токен
            await updateToken();

            // Получаем новый токен
            const newTokenFromDb = (await prisma.token_for_search.findUnique({
                where: { id: 1 },
                select: { token: true },
            })) || { token: '' };

            const newToken = decryptString(newTokenFromDb.token, encryptionKey);
            const newHeaders = {
                ...headers,
                "authorization": "Bearer " + newToken,
            };

            // Повторяем запрос с новым токеном
            return { success: true, data: await searchData(q, newToken, newHeaders) };
        }

        // Обработка других ошибок
        return { error: true, message: error.message };
    }
});
