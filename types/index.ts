import {dequal} from "@redocly/openapi-core/lib/utils";
import {describe} from "node:test";

export{};

declare global {
    interface anketa_data {
        fullName: string,
        birthDate: string,
        faculty: string,
        course: number,
        city: string,
        sex: string,
        roomType: string,
        preferredFloor: number,
        hasChronicDiseases: boolean,
        needsBenefitPlacement: boolean,
        needsSpecialConditions: boolean,
        phone: string,
        email: string,
        sports: boolean,
        sportsType: string,
        boardGames: boolean,
        hobbies: string,
        religion: string,
        sameReligionNeighbor: boolean,
        nationality: string,
        russianProficiency: string,
        englishProficiency: string,
        roomStyle: string
    }
    interface DirectusError {
        errors: Array<{ message: string, extensions: object }>;
        response: {
            status: number;
            statusText: string;
        };
    }
}