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
    req(anketa.fullName, "Full Name");
    req(anketa.birthDate, "Birth Date");
    req(anketa.faculty, "Faculty");
    isNumber(anketa.course, "Course");
    req(anketa.city, "City");
    validateSelect(anketa.sex, ["male", "female"], "Sex");
    validateSelect(anketa.roomType, ["Одноместная", "Двухместная", "Трехместная"], "Room Type");
    isNumber(anketa.preferredFloor, "Preferred Floor");
    email_check(anketa.email);
    phone_check(anketa.phone);
    validateSelect(anketa.sports, [true, false], "Sports");
    validateSelect(anketa.boardGames, [true, false], "Board Games");
    req(anketa.religion, "Religion");
    validateSelect(anketa.sameReligionNeighbor, [true, false], "Same Religion Neighbor");
    req(anketa.nationality, "Nationality");
    validateSelect(anketa.russianProficiency, ["Начальный", "Средний", "Свободный"], "Russian Proficiency");
    validateSelect(anketa.englishProficiency, ["Начальный", "Средний", "Свободный"], "English Proficiency");
    validateSelect(anketa.roomStyle, ["Квартирный", "Коридорный"], "Room Style");
};
