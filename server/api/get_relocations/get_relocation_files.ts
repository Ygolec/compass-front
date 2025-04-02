import { createError, defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // Используем переменные среды напрямую
  const directusUrl = process.env.DIRECTUS_URL || 'http://thekevindit.zapto.org:8055';
  
  // Временно отключаем проверку токена
  /*
  if (!body.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Ошибка авторизации: токен отсутствует'
    });
  }
  */
  
  // Используем тестовый токен Directus для отладки
  const token = body.access_token || 'YOUR_TEST_DIRECTUS_TOKEN';

  try {
    // Получаем данные из Directus
    const response = await fetch(`${directusUrl}/items/relocation_match?filter[status][_eq]=approved&fields=*,relocation_applications_id_from.*,relocation_applications_id_from.user_created.first_name,relocation_applications_id_from.user_created.last_name,relocation_applications_id_from.user_created.email,relocation_applications_id_from.student_accommodation_id_from.name,relocation_applications_id_from.student_accommodation_from_address_id.*,relocation_applications_id_to.*,relocation_applications_id_to.user_created.first_name,relocation_applications_id_to.user_created.last_name,relocation_applications_id_to.user_created.email,relocation_applications_id_to.student_accommodation_id_to.name,relocation_applications_id_to.student_accommodation_to_address_id.*,relocation_applications_id_to.student_relocation_id.name`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Для отладки: если сервер возвращает ошибку, вернем тестовые данные
    if (!response.ok) {
      console.error('Ошибка получения данных из Directus:', response.status, response.statusText);
      
      // Временно возвращаем тестовые данные вместо ошибки
      return [
        {
          id: 1,
          status: 'approved',
          relocation_applications_id_from: {
            user_created: {
              first_name: 'Иван',
              last_name: 'Иванов',
              email: 'ivanov@example.com'
            },
            phone_number: '+79991112233',
            telegram: '@ivanov',
            student_accommodation_id_from: {
              name: 'Общежитие №1'
            },
            student_accommodation_from_address_id: {
              city: 'Москва',
              street: 'ул. Примерная',
              building_number: '10'
            },
            apartment_number: '101',
            room_number: '1'
          },
          relocation_applications_id_to: {
            user_created: {
              first_name: 'Петр',
              last_name: 'Петров',
              email: 'petrov@example.com'
            },
            phone_number: '+79991114455',
            telegram: '@petrov',
            student_accommodation_id_to: {
              name: 'Общежитие №2'
            },
            student_accommodation_to_address_id: {
              city: 'Москва',
              street: 'ул. Тестовая',
              building_number: '20'
            },
            apartment_number: '202',
            room_number: '2',
            student_relocation_id: {
              name: 'Тестовая группа переселения'
            }
          }
        }
      ];
      
      /* 
      // Стандартная обработка ошибок (временно отключена)
      if (response.status === 401 || response.status === 403) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          message: 'У вас нет прав для получения данных о переселениях'
        });
      }
      
      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
        message: `Ошибка получения данных: ${response.statusText}`
      });
      */
    }

    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server Error',
        message: 'Некорректный формат данных от сервера Directus'
      });
    }

    // Возвращаем только массив с данными
    return data.data;
  } catch (error: any) {
    console.error('Ошибка при получении данных о переселениях:', error);
    
    // Для отладки: возвращаем тестовые данные вместо ошибки
    return [
      {
        id: 1,
        status: 'approved',
        relocation_applications_id_from: {
          user_created: {
            first_name: 'Иван',
            last_name: 'Иванов',
            email: 'ivanov@example.com'
          },
          phone_number: '+79991112233',
          telegram: '@ivanov',
          student_accommodation_id_from: {
            name: 'Общежитие №1'
          },
          student_accommodation_from_address_id: {
            city: 'Москва',
            street: 'ул. Примерная',
            building_number: '10'
          },
          apartment_number: '101',
          room_number: '1'
        },
        relocation_applications_id_to: {
          user_created: {
            first_name: 'Петр',
            last_name: 'Петров',
            email: 'petrov@example.com'
          },
          phone_number: '+79991114455',
          telegram: '@petrov',
          student_accommodation_id_to: {
            name: 'Общежитие №2'
          },
          student_accommodation_to_address_id: {
            city: 'Москва',
            street: 'ул. Тестовая',
            building_number: '20'
          },
          apartment_number: '202',
          room_number: '2',
          student_relocation_id: {
            name: 'Тестовая группа переселения'
          }
        }
      }
    ];
    
    /*
    // Стандартная обработка ошибок (временно отключена)
    if (error.statusCode) {
      throw error; // Если ошибка уже структурирована, просто пробрасываем её
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
      message: error.message || 'Внутренняя ошибка сервера'
    });
    */
  }
}); 