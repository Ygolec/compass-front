export function email_check(data: string) {
    const pattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
    if (data.match(pattern)) {
        return true;
    }
    else
        return "Вы ввели неправильный Email";
}

export function email_hse_student_check(data: string): boolean | string {
    const pattern = "^[\\w-\\.]+@edu\\.hse\\.ru$";
    if (new RegExp(pattern).test(data)) {
        return true;
    } else {
        return "Вы ввели неправильный Email. Адрес должен быть в домене @edu.hse.ru.";
    }
}


export function required(value: any) {
    return !!value || 'Это обязательное поле';
}
export function password_check(data: string): boolean | string {
    const pattern = "^[a-zA-Z0-9_]{4,22}$";
    if (new RegExp(pattern).test(data)) {
        return true;
    } else {
        return "Неверный пароль: минимальная длина 4, только латинские буквы, цифры и символ подчеркивания, без кириллицы.";
    }
}

export function password_confirm(password: string) {
    return (secondPassword: string) => { if (password == secondPassword) return true; else return "Пароли не совпадают"; }
}

import { createError } from "h3";


const phone_check = (phone: string) => {
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
        throw createError({ message: "Invalid phone number format", status: 400 });
    }
};

const isNumber = (value: any, fieldName: string) => {
    if (isNaN(value)) {
        throw createError({ message: `${fieldName} must be a number`, status: 400 });
    }
};

const validateSelect = (value: any, allowedValues: any[], fieldName: string) => {
    if (!allowedValues.includes(value)) {
        throw createError({ message: `Invalid value for ${fieldName}`, status: 400 });
    }
};

const req = (value: any, fieldName: string) => {
    if (!value) {
        throw createError({ message: `${fieldName} is required`, status: 400 });
    }
};

export const validateAnketaData = (anketa: anketa_data) => {
    req(anketa.lastName, "Last Name");
    req(anketa.firstName, "First Name");

    req(anketa.birthDate, "Birth Date");
    req(anketa.facultyFullName, "Faculty (Full)");
    req(anketa.facultyShortName, "Faculty (Short)");
    isNumber(anketa.course, "Course");
    req(anketa.city, "City");

    phone_check(anketa.phone);
    email_check(anketa.email);

    validateSelect(anketa.roomType, ["Одноместная", "Двухместная", "Трехместная", "Четырехместная"], "Room Type");
    isNumber(anketa.preferredFloor, "Preferred Floor");
    validateSelect(anketa.roomStyle, ["Квартирный", "Коридорный"], "Room Style");

    validateSelect(anketa.russianProficiency, ["Начальный", "Средний", "Свободный"], "Russian Proficiency");
    validateSelect(anketa.englishProficiency, ["Начальный", "Средний", "Свободный"], "English Proficiency");

    validateSelect(anketa.needsBenefitPlacement, [true, false], "Needs Benefit Placement");
    validateSelect(anketa.hasChronicDiseases, [true, false], "Has Chronic Diseases");
    validateSelect(anketa.boardGames, [true, false], "Board Games");

    if (anketa.doSports) req(anketa.sports, "Sports Type");

    if (anketa.hasHobbies) req(anketa.hobbies, "Hobbies");
};

