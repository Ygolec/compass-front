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

export function password_confirm(password: Ref<string>) {
    return computed(() => {
        return (value: string) => {
            return value === password.value ? true : "Пароли не совпадают";
        };
    });
}
export function telegram_tag_check(data: string): boolean | string {
    const pattern = "^@[a-zA-Z0-9_]{5,32}$";
    if (new RegExp(pattern).test(data)) {
        return true;
    } else {
        return "Неверный формат Telegram-тега. Тег должен начинаться с '@', содержать от 5 до 32 символов: латинские буквы, цифры и знак подчеркивания.";
    }
}

export function phone_russian_check(data: string): boolean | string {
    const pattern = "^\\+7\\d{10}$";
    if (new RegExp(pattern).test(data)) {
        return true;
    } else {
        return "Неверный формат номера телефона. Введите номер в формате +7XXXXXXXXXX (10 цифр после +7).";
    }
}
import { createError } from "h3";

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
    validateSelect(anketa.sex, ["male", "female"], "Sex");
    validateSelect(anketa.roomType, ["Одноместная", "Двухместная", "Трехместная"], "Room Type");
    isNumber(anketa.preferredFloor, "Preferred Floor");
    email_check(anketa.email);
    phone_russian_check(anketa.phone);
    validateSelect(anketa.sports, [true, false], "Sports");
    validateSelect(anketa.boardGames, [true, false], "Board Games");

    phone_russian_check(anketa.phone);
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

