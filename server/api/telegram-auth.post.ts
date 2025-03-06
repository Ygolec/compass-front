import { defineEventHandler, getQuery } from 'h3'
import * as crypto from 'crypto'

const config = useRuntimeConfig()

// Получаем токен вашего бота (т.к. нужно для проверки подписи)
const BOT_TOKEN = config.TELEGRAM_TOKEN // или держите как-то ещё

export default defineEventHandler(async (event) => {
    // Из GET или POST параметров (зависит от того, как вы настроили)
    const query = getQuery(event)

    // Все ключи, кроме hash, сортируем и собираем в строку "key=value\n"
    const { hash, ...data } = query
    const dataCheckArr = Object.keys(data)
        .sort()
        .map((key) => `${key}=${data[key]}`)
        .join('\n')

    // Формируем ключ HMAC из ключа SHA256( "WebAppData" + bot_token )
    const secretKey = crypto
        .createHash('sha256')
        .update(BOT_TOKEN)
        .digest()

    // Высчитываем хеш
    const hmac = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckArr)
        .digest('hex')

    // Сравниваем с пришедшим hash (нужно сравнивать в «lowercase» варианте)
    if (hmac !== hash) {
        // Значит данные подделаны, отказываем
        throw new Error('Invalid hash from Telegram')
    }

    // Если hash совпал — данные подлинные
    // Можно извлечь из data, например, user_id
    const telegramId = data.id
    const username = data.username
    console.log(data);
    // ...и т.д.



    return { success: true }
})
