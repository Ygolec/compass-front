import {defineEventHandler, getQuery} from 'h3'
import * as crypto from 'crypto'
import {createDirectus, createItem, readItems, rest, staticToken, updateItem} from "@directus/sdk";

function verifyTelegramLoginData(params: Record<string, string>, botToken: string): boolean {
    // 1. Извлекаем `hash`, остальные поля идут в data_check_string
    const {hash, ...data} = params
    if (!hash) {
        return false
    }


    // 2. Формируем data_check_string — «key=value\nkey2=value2\n...»
    //    Сортировка по алфавиту ключей
    const dataCheckArr = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('\n')

    // 3. secret_key = SHA256(<bot_token>)
    const secretKey = crypto
        .createHash('sha256')
        .update(botToken)
        .digest()

    // 4. hmac = HMAC_SHA256(data_check_string, secret_key)
    const hmac = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckArr)
        .digest('hex')


    // 5. Сравниваем hmac с пришедшим от Telegram hash
    //    Обычно hash и hmac используют нижний регистр (lowercase)
    return hmac === hash
}

const config = useRuntimeConfig();
// Подставьте реальный токен бота
const BOT_TOKEN = config.TELEGRAM_TOKEN

export default defineEventHandler(async (event) => {
    const headers = getHeaders(event)
    const query = getQuery(event)
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());


    const user: user = await $fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: headers as HeadersInit
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    // Из параметров отделяем hash
    const {hash, ...data} = query

    // Если хеша нет, либо нет нужных полей — отказываем
    if (!hash || !data.id || !data.auth_date) {
        return {error: 'Missing required Telegram data'}
    }

    if (verifyTelegramLoginData(query, BOT_TOKEN)) {
        const is_user_have_telegram_id = await client.request(readItems('telegram_user_links', {
            filter: {
                telegram_id: {
                    '_eq': data.id
                }
            }
        }))
        if (is_user_have_telegram_id.length !== 0) {
            if (is_user_have_telegram_id.status === 'link') {
                throw createError({
                    statusCode: 400,
                    message: 'Telegram id already exists',
                })
            } else {
                const update_telegram_user_link = await client.request(updateItem('telegram_user_links', is_user_have_telegram_id[0].id, {
                    user_id: user.directus_id,
                    telegram_id: data.id,
                    telegram_username: data.username,
                    status: 'link'
                }))
            }

            return {
                success: true,
            }
        }
        const create_telegram_user_link = await client.request(createItem('telegram_user_links', {
            user_id: user.directus_id,
            telegram_id: data.id,
            telegram_username: data.username,
        }))

        return {
            success: true,
        }
    }


})
