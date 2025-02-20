import {
    createDirectus, createFolder,
    createItem, createItems,
    readFolder,
    readFolders,
    readItems,
    rest,
    staticToken, updateItem,
    uploadFiles
} from "@directus/sdk";

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event);
    const headers = getHeaders(event)
    const config = useRuntimeConfig();
    const client = createDirectus(config.DIRECTUS_URL).with(staticToken(config.DIRECTUS_TOKEN)).with(rest());

    if (!formData || !headers) {
        throw createError({
            statusCode: 400,
            message: 'No data',
        })
    }

    const user: user = await $fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: headers as HeadersInit
    });

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        })
    }

    const photos: Array<{
        filename: string;
        type: string;
        data: Buffer;
    }> = [];

    let studentApplication: student_application | null = null;

    // Перебираем все элементы, полученные из formData
    for (const field of formData) {
        // Если это файл (есть filename и type)
        if (field.name === 'photos' && field.filename && field.type) {
            photos.push({
                filename: field.filename,
                type: field.type,
                data: field.data,
            });
        }

        // Если это наше JSON-поле
        if (field.name === 'student_application') {
            // Преобразуем Buffer в строку и парсим
            studentApplication = JSON.parse(field.data.toString());
        }
    }

    if (!studentApplication) {
        throw createError({
            statusCode: 400,
            message: 'No application data',
        })
    }

    if (!studentApplication.student_relocation_id) {
        throw createError({
            statusCode: 400,
            message: 'No student_relocation_id',
        })
    }

    if (studentApplication.student_relocation_id) {
        const student_relocation_applications = await client.request(
            readItems('student_relocation_applications', {
                filter: {
                    student_relocation_id: studentApplication.student_relocation_id,
                    user_created: user.directus_id
                }
            })
        )
        if (student_relocation_applications.length) {
            throw createError({
                statusCode: 400,
                message: 'Application exists',
            })
        }
    }

    const student_relocation_application = await client.request(
        createItem('student_relocation_applications', {
            status: 'created',
            user_created: user.directus_id,
            student_relocation_id: studentApplication.student_relocation_id,
            student_accommodation_id_from: studentApplication.accommodation_from.id,
            student_accommodation_from_address_id: studentApplication.accommodation_from.id_address,
            student_accommodation_id_to: studentApplication.accommodation_to.id,
            student_accommodation_to_address_id: studentApplication.accommodation_to.id_address,
            floor: studentApplication.floor,
            apartment_number: studentApplication.apartment_number,
            room_number: studentApplication.room_number,
            occupancy: studentApplication.occupancy,
            telegram: studentApplication.telegram,
            phone_number: studentApplication.phone_number,
        })
    )

    const folder = await client.request(
        readFolders({
            fields: ['id, name'],
            filter: {
                parent: '1ae9bbb8-785e-444a-8dd9-a2b5399e26c2',
                name: student_relocation_application.id
            }
        })
    )

    if (!folder.length) {
        const createdFolder = await client.request(
            createFolder({
                parent: '1ae9bbb8-785e-444a-8dd9-a2b5399e26c2',
                name: student_relocation_application.id
            })
        )

        if (photos.length && createdFolder) {
            const formData = new FormData();
            for (let i = 0; i < photos.length; i++) {
                formData.append('folder', createdFolder.id);
                formData.append('uploaded_by', user.directus_id);
                formData.append('file', new Blob([photos[i].data], {type: photos[i].type}), photos[i].filename);
            }
            const uploadPhotos = await client.request(
                uploadFiles(formData)
            )
            await client.request(createItems('student_relocation_applications_files', uploadPhotos.map((photo: any) => ({
                student_relocation_applications_id: student_relocation_application.id,
                directus_files_id: photo.id.toString(),
            }))));
        }
    } else {
        if (photos.length && folder.length) {
            const formData = new FormData();
            for (let i = 0; i < photos.length; i++) {
                formData.append('folder', folder.id);
                formData.append('uploaded_by', user.directus_id);
                formData.append('file', new Blob([photos[i].data], {type: photos[i].type}), photos[i].filename);
            }
            const uploadPhotos = await client.request(
                uploadFiles(formData)
            )
            await client.request(createItems('student_relocation_applications_files', uploadPhotos.map((photo: any) => ({
                student_relocation_applications_id: student_relocation_application.id,
                directus_files_id: photo.id.toString(),
            }))));
        }
    }


    return true
})