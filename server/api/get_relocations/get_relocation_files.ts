import { createError, defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // Используем переменные среды напрямую
  const directusUrl = process.env.DIRECTUS_URL || 'http://thekevindit.zapto.org:8055';
  
  if (!body.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Ошибка авторизации: токен отсутствует'
    });
  }

  try {
    // Получаем данные из Directus
    const response = await fetch(`${directusUrl}/items/relocation_match?filter[status][_eq]=approved&fields=*,relocation_applications_id_from.*,relocation_applications_id_from.user_created.first_name,relocation_applications_id_from.user_created.last_name,relocation_applications_id_from.user_created.email,relocation_applications_id_from.student_accommodation_id_from.name,relocation_applications_id_from.student_accommodation_from_address_id.*,relocation_applications_id_to.*,relocation_applications_id_to.user_created.first_name,relocation_applications_id_to.user_created.last_name,relocation_applications_id_to.user_created.email,relocation_applications_id_to.student_accommodation_id_to.name,relocation_applications_id_to.student_accommodation_to_address_id.*,relocation_applications_id_to.student_relocation_id.name`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${body.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Ошибка получения данных из Directus:', response.status, response.statusText);
      
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
    
    if (error.statusCode) {
      throw error; // Если ошибка уже структурирована, просто пробрасываем её
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Error',
      message: error.message || 'Внутренняя ошибка сервера'
    });
  }
}); 