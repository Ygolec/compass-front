import { createDirectus, createItem, readItems, rest, withToken } from "@directus/sdk";
import { email_check, email_hse_student_check, validateAnketaData } from "~/utils/rules";

export default defineEventHandler(async (event) => {
    const anketa_data: anketa_data = await readBody(event);
    const config = useRuntimeConfig();
    console.log(anketa_data);
    const directus_token: string = config.DIRECTUS_TOKEN || "";
    const client = createDirectus(config.DIRECTUS_URL).with(rest());

    if (!email_hse_student_check(anketa_data.email)) {
        throw createError({
            message: 'Неверный формат email',
            status: 401
        });
    }

    try {
        const existingEmail = await client.request(withToken(directus_token,
            readItems("Anketa_data", {
                filter: { email_edu: { _eq: anketa_data.email } },
                limit: 1
            })
        ));

        if (existingEmail.length > 0) {
            throw createError({
                message: 'Этот email уже зарегистрирован',
                status: 409
            });
        }
        // тут надо validate сделать потом короче
        const create_anketa = await client.request(withToken(directus_token, createItem("Anketa_data", {
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
            roomstyle: anketa_data.roomStyle
        })));
        console.log(create_anketa);
    } catch (error) {
        console.log(error);
        const e = error as DirectusError;
        const errorMessage = e?.errors?.[0]?.message || 'Неизвестная ошибка';
        const statusCode = e?.response?.status || 500;

        throw createError({
            message: errorMessage,
            status: statusCode
        });
    }
    return true;
});
