import {defineEventHandler, readBody} from 'h3';
import axios from 'axios';

export default defineEventHandler(async (event) => {
    const {email, password} = await readBody(event);

    if (!email || !password) {
        return {
            status: 'error',
            message: 'Email и пароль обязательны',
        };
    }

    try {
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakePayload.fakeSignature';
        // Отправляем запрос на внешний сервер
        // const response = await axios.post('https://external-server.com/api/login', {
        //     email,
        //     password,
        // });
        //
        // const {token} = response.data;

        const {token} = {token: fakeToken};

        return {
            status: 'success',
            token, // Возвращаем JWT токен
        };
    } catch (error: any) {
        const errorMessage = error.response.data.message;

        // Обработка конкретных ошибок
        if (errorMessage === 'User not found') {
            return {
                status: 'error',
                message: 'Пользователь с таким email не найден',
            };
        }

        if (errorMessage === 'Incorrect password') {
            return {
                status: 'error',
                message: 'Неверный пароль',
            };
        }


        return {
            status: 'error',
            message: 'Ошибка подключения к серверу',
        };
    }
});
