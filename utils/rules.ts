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