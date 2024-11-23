export function email_check(data: string) {
    const pattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
    if (data.match(pattern)) {
        return true;
    }
    else
        return "Вы ввели неправильный Email";
}

export function required(value: any) {
    return !!value || 'Это обязательное поле';
}
export function password_check(data:string) {
    const pattern = "^[a-zA-Z]\\w{3,21}$";
    if (data.match(pattern)) {
        return true;
    }
    else
        return "Неверный пароль: минимальная длина пароля 4, без кириллицы";
}
export function password_confirm(password: string) {
    return (secondPassword: string) => { if (password == secondPassword) return true; else return "Пароли не совпадают"; }
}