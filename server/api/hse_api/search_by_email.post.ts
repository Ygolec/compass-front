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
    const updateResponse = await fetch('/api/hse_api/update_token');
    if (!updateResponse.ok) {
        throw new Error('Ошибка обновления токена');
    }
}

async function fetchEmailData(email:string, token:string, headers:any) {
    const apiUrl = `https://api.hseapp.ru/v3/dump/email/${email}`;
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
        throw new Error('Ошибка запроса с токеном');
    }

    return await response.json();
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const { email } = await readBody(event);
    const encryptionKey = config.ENCRYPTION_KEY_FOR_HSE_TOKEN;

    const tokenFromDb = (await prisma.token_for_search.findUnique({
        where: { id: 1 },
        select: { token: true },
    })) || { token: '' };

    let token = decryptString(tokenFromDb.token, encryptionKey);
    let headers = {
        "x-android-build": "97910",
        "authorization": "Bearer " + token,
        "accept-language": "ru-RU",
        "user-agent": "HSE App X/1.34.1; release (Pixel 7 Pro; Android/15; ru_RU; 1080x2340)",
        "accept-encoding": "gzip",
    };

    try {
        const data = await fetchEmailData(email, token, headers);
        return { success: true, data };
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'Ошибка запроса с токеном') {
            await prisma.is_active_token_for_search.update({
                where: { id: 1 },
                data: { is_active: false },
            });

            await updateToken();

            const newTokenFromDb = (await prisma.token_for_search.findUnique({
                where: { id: 1 },
                select: { token: true },
            })) || { token: '' };

            token = decryptString(newTokenFromDb.token, encryptionKey);
            headers = {
                ...headers,
                "authorization": "Bearer " + token,
            };

            try {
                const data = await fetchEmailData(email, token, headers);
                return { success: true, data };
            } catch (retryError: unknown) {
                return { error: true, message: retryError instanceof Error ? retryError.message : 'Unknown error' };
            }
        }

        return { error: true, message: error instanceof Error ? error.message : 'Unknown error' }
    }
});