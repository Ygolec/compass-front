import {createDirectus, createItem, readItem, readItems, rest, withToken} from "@directus/sdk";
import { email_check, email_hse_student_check, validateAnketaData } from "~/utils/rules";

export default defineEventHandler(async (event) => {
    const anketa_data: anketa_data = await readBody(event);
    const config = useRuntimeConfig();
    console.log(anketa_data);
    const directus_token: string = config.DIRECTUS_TOKEN || ""
    const client = createDirectus(config.DIRECTUS_URL).with(rest());

    if (email_hse_student_check(anketa_data.email) != true) {
        throw createError({
            message: 'wrong email type',
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
        const create_anketa = await client.request(withToken(directus_token, createItem("Anketa_data", {
            fullname: anketa_data.fullName,
            birthdate: anketa_data.birthDate,
            faculty: anketa_data.faculty,
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
            sports: anketa_data.sports,
            sportstype: anketa_data.sportsType,
            boardgames: anketa_data.boardGames,
            hobbies: anketa_data.hobbies,
            religion: anketa_data.religion,
            samereligionneighbor: anketa_data.sameReligionNeighbor,
            nationality: anketa_data.nationality,
            russianproficiency: anketa_data.russianProficiency,
            englishproficiency: anketa_data.englishProficiency,
            roomstyle: anketa_data.roomStyle
        })));
        console.log(create_anketa)
    } catch (error) {
        console.log(error)
        const e = error as DirectusError
        const errorMessage = e?.errors?.[0]?.message || 'Unknown error';
        const statusCode = e?.response?.status || 500;

        throw createError({
            message: errorMessage,
            status: statusCode
        });
    }
    return true;
});