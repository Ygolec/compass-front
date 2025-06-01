import { createDirectus, createItem, readItems, rest, withToken } from "@directus/sdk";
import { email_check, email_hse_student_check } from "~/utils/rules";
import type { AnketaData, ApiError } from '~/types';

interface DirectusError {
    errors?: Array<{ message: string }>;
    response?: { status: number };
}

const MAX_DATA_SIZE = 1024 * 1024; // 1MB

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const headers = getHeaders(event)

    if (!headers) {
        throw createError({
            statusCode: 400,
            message: 'No data',
        })
    }

    if (!config.DIRECTUS_URL) {
        throw createError({
            message: 'DIRECTUS_URL не настроен',
            status: 500
        });
    }

    if (!config.DIRECTUS_TOKEN) {
        throw createError({
            message: 'DIRECTUS_TOKEN не настроен',
            status: 500
        });
    }
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

    const anketa_data: AnketaData = await readBody(event);
    
    // Проверка размера данных
    const dataSize = new TextEncoder().encode(JSON.stringify(anketa_data)).length;
    if (dataSize > MAX_DATA_SIZE) {
        throw createError({
            message: 'Размер данных превышает допустимый лимит',
            status: 413
        });
    }

    if (!email_hse_student_check(anketa_data.email)) {
        throw createError({
            message: 'Неверный формат email',
            status: 401
        });
    }

    const client = createDirectus(config.DIRECTUS_URL).with(rest());

    try {
        const existing_email = await client.request(withToken(config.DIRECTUS_TOKEN,
            readItems("questionnaires", {
                filter: { email_edu: { _eq: anketa_data.email } },
                limit: 1
            })
        ));

        if (existing_email.length > 0) {
            throw createError({
                message: 'Этот email уже зарегистрирован',
                status: 409
            });
        }

        const create_anketa = await client.request(withToken(config.DIRECTUS_TOKEN, createItem("questionnaires", {
            user_id: user.directus_id,
            lastname: anketa_data.lastName,
            firstname: anketa_data.firstName,
            middlename: anketa_data.middleName,
            birthdate: anketa_data.birthDate,
            facultyfullname: anketa_data.facultyFullName,
            facultyshortname: anketa_data.facultyShortName,
            course: anketa_data.course,
            city: anketa_data.city,
            sex: anketa_data.sex,
            roomtype: anketa_data.roomType,
            preferredfloor: anketa_data.preferredFloor,
            haschronicdiseases: anketa_data.hasChronicDiseases,
            needsbenefitplacement: anketa_data.needsBenefitPlacement,
            needsspecialconditions: anketa_data.needsSpecialConditions,
            phone: anketa_data.phone,
            email_edu: anketa_data.email,
            boardgames: anketa_data.boardGames,
            sports: anketa_data.doSports,
            sportstype: anketa_data.sports,
            hobbies: anketa_data.hobbies,
            russianproficiency: anketa_data.russianProficiency,
            englishproficiency: anketa_data.englishProficiency,
            roomstyle: anketa_data.roomStyle,
            do_smoke: anketa_data.doSmoke,
            early_bird: anketa_data.earlyBird,
            is_foreigner: anketa_data.isForeigner
        })));

        return { success: true, data: create_anketa };
    } catch (error) {
        const e = error as DirectusError;
        const error_message = e?.errors?.[0]?.message || 'Неизвестная ошибка';
        const status_code = e?.response?.status || 500;

        // Логируем только необходимую информацию
        console.error('Ошибка при создании анкеты:', {
            status: status_code,
            message: error_message
        });

        throw createError({
            message: error_message,
            status: status_code
        });
    }
}); 