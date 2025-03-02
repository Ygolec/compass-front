import {dequal} from "@redocly/openapi-core/lib/utils";
import {describe} from "node:test";

export{};

declare global {
    interface anketa_data {
        lastName: string;
        firstName: string;
        middleName: string;
        birthDate: string;
        facultyFullName: string;
        facultyShortName: string;
        course: number;
        city: string;
        sex: string;
        roomType: string;
        preferredFloor: number;
        hasChronicDiseases: boolean;
        needsBenefitPlacement: boolean;
        needsSpecialConditions: boolean;
        phone: string;
        email: string;
        doSports: boolean;
        sports: string[];
        hasHobbies: boolean;
        hobbies: string[];
        boardGames: boolean;
        russianProficiency: string;
        englishProficiency: string;
        roomStyle: string;
        doSmoke: boolean;
        earlyBird: boolean;
    }

    interface DirectusError {
        errors: Array<{ message: string; extensions: object }>;
        response: {
            status: number;
            statusText: string;
        };
    }
}
