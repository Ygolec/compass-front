import {defineEventHandler} from 'h3'
import {wrapper} from 'axios-cookiejar-support'
import axios from 'axios'
import {CookieJar} from 'tough-cookie'
import * as cheerio from 'cheerio'
import crypto from 'node:crypto'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

function encryptString(plaintext: string, secretKey: string): string {
    // Генерируем IV
    const iv = crypto.randomBytes(16)
    // Для ключа используем SHA-256
    const key = crypto.createHash('sha256').update(secretKey).digest()

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Возвращаем IV (hex) + двоеточие + зашифрованный текст
    const ivHex = iv.toString('hex')
    return `${ivHex}:${encrypted}`
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()


    const username = config.HSE_EMAIL
    const password = config.HSE_EMAIL_PASSWORD
    const encryptionKey = config.ENCRYPTION_KEY_FOR_HSE_TOKEN

    // Готовим cookie-jar и клиент с поддержкой cookies
    const jar = new CookieJar()
    const client = wrapper(axios.create({jar}))

    // 1) GET на /auth
    const getUrl =
        "https://saml.hse.ru/realms/hse/protocol/openid-connect/auth" +
        "?client_id=app-x-android" +
        "&response_type=code" +
        "&redirect_uri=ru.hse.hseappx://saml.hse.ru/authorize_callback"

    // Запрос с перенаправлениями (allow_redirects=True в Python)
    // У axios по умолчанию maxRedirects: 5, если нужно, можете скорректировать
    const r1 = await client.get(getUrl)

    // 2) Парсим HTML, ищем <form>, <input> и т.д.
    const $ = cheerio.load(r1.data)
    const form = $('form')
    if (!form || form.length === 0) {
        // Если форма не найдена, возможно, уже авторизованы
        return {error: 'Не нашли <form> в ответе! Возможно, уже прошли авторизацию?'}
    }

    const formAction = form.attr('action')
    if (!formAction) {
        return {error: 'У <form> не найден атрибут action'}
    }

    // Собираем все hidden-поля (и не только), как в Python
    const formFields: Record<string, string> = {}
    form.find('input').each((_, el) => {
        const name = $(el).attr('name')
        const value = $(el).attr('value') || ''
        if (name) {
            formFields[name] = value
        }
    })

    // Прописываем username / password
    formFields['username'] = username || ''
    formFields['password'] = password || ''

    // 3) POST login
    // Чтобы повторить логику allow_redirects=False, укажем maxRedirects: 0
    // и поймаем Location из заголовка
    let location: string | undefined
    try {
        const r2 = await client.post(
            formAction,
            new URLSearchParams(formFields),
            {maxRedirects: 0, validateStatus: () => true} // чтобы не бросало ошибку на 302
        )
        location = r2.headers['location']
    } catch (error) {
        return {error: `Ошибка при POST на форму авторизации: ${String(error)}`}
    }

    if (!location) {
        return {error: 'Не удалось получить заголовок Location после POST /login'}
    }

    // Из location нужно вытащить ?code=...
    const urlObj = new URL(location)
    const code = urlObj.searchParams.get('code')

    if (!code) {
        return {error: 'Не удалось извлечь параметр code из Location'}
    }

    // 4) Меняем code на токен (POST /token)
    const tokenUrl = "https://saml.hse.ru/realms/hse/protocol/openid-connect/token"
    const dataToken = new URLSearchParams({
        code,
        client_id: "app-x-android",
        redirect_uri: "ru.hse.hseappx://saml.hse.ru/authorize_callback",
        grant_type: "authorization_code"
    })

    try {
        const r3 = await client.post(tokenUrl, dataToken, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "okhttp/4.11.0"
            }
        })

        if (r3.status !== 200) {
            return {
                error: `Не получили 200 при обмене code на токен, статус: ${r3.status}`,
                details: r3.data
            }
        }


        // r3.data должен содержать JSON с токенами
        const jsonResp = r3.data
        const accessToken = jsonResp['access_token']
        if (!accessToken) {
            return {error: 'В ответе нет access_token'}
        }

        if (!encryptionKey) {
            return {error: 'ENCRYPTION_KEY_FOR_HSE_TOKEN не задан в .env'}
        }

        const encryptedToken = encryptString(accessToken, encryptionKey)

        const is_active_token = await prisma.is_active_token_for_search.findUnique({
            where: {
                id: 1
            },
            select: {
                is_active: true
            }
        }) || false


        if (is_active_token && !is_active_token.is_active) {
            await prisma.token_for_search.update({
                where: {
                    id: 1
                },
                data: {
                    token: encryptedToken,
                    updated_at: new Date()
                }
            }).finally(async () => {
                await prisma.is_active_token_for_search.update({
                    where: {
                        id: 1
                    },
                    data: {
                        is_active: true,
                        updated_at: new Date()
                    }
                })
            })

            return {
                success: true,
                message: 'Access token успешно получен и сохранён.',
            }
        } else {
            return {
                error: 'Токен не сохранён, т.к. активация токена отключена.'
            }
        }




    } catch (error) {
        return {error: `Ошибка при обмене code на токен: ${String(error)}`}
    }
})
