import { createError } from "h3";

export function email_check(data: string): boolean | string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(data)) {
        return true;
    } else {
        return "Неверный формат email";
    }
}

export function email_hse_student_check(data: string): boolean | string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(data)) {
        return true;
    } else {
        return "Неверный формат email";
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
    const phoneRegex = /^\+7\d{10}$/;
    if (phoneRegex.test(data)) {
        return true;
    } else {
        return "Неверный формат номера телефона. Введите номер в формате +7XXXXXXXXXX (10 цифр после +7).";
    }
}

interface ValidationError {
    message: string;
    status: number;
}

const createValidationError = (message: string): ValidationError => ({
    message,
    status: 400
});

const isNumber = (value: any, fieldName: string): void => {
    if (isNaN(value)) {
        throw createValidationError(`${fieldName} должно быть числом`);
    }
};

const validateSelect = (value: any, allowedValues: any[], fieldName: string): void => {
    if (!allowedValues.includes(value)) {
        throw createValidationError(`Недопустимое значение для ${fieldName}`);
    }
};

const req = (value: any, fieldName: string): void => {
    if (!value) {
        throw createValidationError(`${fieldName} обязательно для заполнения`);
    }
};

export interface AnketaData {
    lastName: string;
    firstName: string;
    middleName?: string;
    birthDate: string;
    facultyFullName: string;
    facultyShortName: string;
    course: number;
    city: string;
    sex: 'male' | 'female';
    roomType: 'Одноместная' | 'Двухместная' | 'Трехместная' | 'Четырехместная';
    preferredFloor: number;
    hasChronicDiseases: boolean;
    needsBenefitPlacement: boolean;
    needsSpecialConditions: boolean;
    phone: string;
    email: string;
    boardGames: boolean;
    doSports: boolean;
    sports?: string;
    hobbies?: string;
    russianProficiency: 'Начальный' | 'Средний' | 'Свободный';
    englishProficiency: 'Начальный' | 'Средний' | 'Свободный';
    roomStyle: 'Квартирный' | 'Коридорный';
    doSmoke: boolean;
    earlyBird: boolean;
}

export const validateAnketaData = (anketa: AnketaData): void => {
    try {
        // Обязательные поля
        req(anketa.lastName, "Фамилия");
        req(anketa.firstName, "Имя");
        req(anketa.birthDate, "Дата рождения");
        req(anketa.facultyFullName, "Факультет (полное название)");
        req(anketa.facultyShortName, "Факультет (сокращенное название)");
        req(anketa.city, "Город");
        req(anketa.phone, "Телефон");
        req(anketa.email, "Email");

        // Валидация числовых полей
        isNumber(anketa.course, "Курс");
        isNumber(anketa.preferredFloor, "Предпочитаемый этаж");

        // Валидация выбора из списка
        validateSelect(anketa.sex, ["male", "female"], "Пол");
        validateSelect(anketa.roomType, ["Одноместная", "Двухместная", "Трехместная", "Четырехместная"], "Тип комнаты");
        validateSelect(anketa.roomStyle, ["Квартирный", "Коридорный"], "Стиль комнаты");
        validateSelect(anketa.russianProficiency, ["Начальный", "Средний", "Свободный"], "Уровень русского языка");
        validateSelect(anketa.englishProficiency, ["Начальный", "Средний", "Свободный"], "Уровень английского языка");

        // Валидация булевых полей
        validateSelect(anketa.hasChronicDiseases, [true, false], "Наличие хронических заболеваний");
        validateSelect(anketa.needsBenefitPlacement, [true, false], "Необходимость льготного размещения");
        validateSelect(anketa.needsSpecialConditions, [true, false], "Необходимость специальных условий");
        validateSelect(anketa.boardGames, [true, false], "Настольные игры");
        validateSelect(anketa.doSports, [true, false], "Занятия спортом");
        validateSelect(anketa.doSmoke, [true, false], "Курение");
        validateSelect(anketa.earlyBird, [true, false], "Ранний подъем");

        // Валидация email и телефона
        const emailCheck = email_check(anketa.email);
        if (emailCheck !== true) {
            throw createValidationError(emailCheck as string);
        }

        const phoneCheck = phone_russian_check(anketa.phone);
        if (phoneCheck !== true) {
            throw createValidationError(phoneCheck as string);
        }

        // Условная валидация
        if (anketa.doSports && !anketa.sports) {
            throw createValidationError("Укажите вид спорта");
        }

        if (anketa.hobbies && !anketa.hobbies.trim()) {
            throw createValidationError("Укажите хобби");
        }
    } catch (error: any) {
        if (error.status) {
            throw createError({
                statusCode: error.status,
                message: error.message
            });
        }
        throw error;
    }
};
