// Добавляем объявление типа для file-saver
declare module 'file-saver';

interface DirectusRole {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

<template>
  <div>
    <v-card v-if="relocations && Object.keys(relocations).length" class="mb-4">
      <v-card-actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-download"
          @click="downloadAllDOCX"
        >
          Скачать все DOCX
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else class="mb-4">
      <v-card-text>
        <v-empty-state
            icon="mdi-magnify"
            text="Нет данных для отображения"
            title="Нет данных">
        </v-empty-state>
      </v-card-text>
    </v-card>

    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      size="64"
      class="ma-auto d-flex"
    ></v-progress-circular>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-expansion-panels v-if="relocations">
      <v-expansion-panel
        v-for="(group, groupName) in relocations"
        :key="groupName.toString()"
        class="mb-4"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            {{ formatGroupName(groupName.toString()) }}
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-file-download"
            class="mb-4"
            @click="downloadGroupDOCX(groupName.toString())"
          >
            Скачать все документы для этой группы
          </v-btn>

          <v-row>
            <v-col
              v-for="(relocation, index) in group"
              :key="index"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="h-100 card-hover">
                <v-card-title class="text-subtitle-1">
                  <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
                  Переселение #{{ index + 1 }}
                  <v-chip
                    :color="relocation.type === 'internal' ? 'success' : 'warning'"
                    size="small"
                    class="ml-2"
                  >
                    {{ relocation.type === 'internal' ? 'Внутреннее' : 'Внешнее' }}
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-account</v-icon>
                      </template>
                      <v-list-item-title>От: {{ relocation.from.fullName }}</v-list-item-title>
                      <v-list-item-subtitle>{{ relocation.from.accommodationFrom }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-account</v-icon>
                      </template>
                      <v-list-item-title>Кому: {{ relocation.to.fullName }}</v-list-item-title>
                      <v-list-item-subtitle>{{ relocation.to.accommodationTo }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>Адрес отправителя</v-list-item-title>
                      <v-list-item-subtitle>{{ relocation.from.addressFrom }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>Адрес получателя</v-list-item-title>
                      <v-list-item-subtitle>{{ relocation.to.addressTo }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-file-document"
                    @click="downloadDOCX(relocation.from, relocation.to, relocation.type)"
                  >
                    Скачать документы
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Document, Packer, Paragraph, AlignmentType, HeadingLevel } from 'docx';
import { useAuthStore } from '~/stores/auth_store';
import pkg from 'file-saver';
const { saveAs } = pkg;


interface Address {
  city: string;
  street: string;
  building_number: string;
}

interface FromUser {
  fullName: string;
  email: string;
  phone: string;
  telegram: string;
  accommodationFrom: string;
  addressFrom: string;
  apartmentFrom: string;
  roomFrom: string;
}

interface ToUser {
  fullName: string;
  email: string;
  phone: string;
  telegram: string;
  accommodationTo: string;
  addressTo: string;
  apartmentTo: string;
  roomTo: string;
}

type RelocationType = 'internal' | 'external';

interface RelocationData {
  from: FromUser;
  to: ToUser;
  type: RelocationType;
}

interface Relocations {
  [groupName: string]: RelocationData[];
}

const authStore = useAuthStore();
const relocations = ref<Relocations>({});
const loading = ref(false);
const error = ref<string | null>(null);
const canDownloadFiles = ref(true);

onMounted(async () => {
  // await checkUserRole();
  await fetchRelocations();
});

async function checkUserRole() {
  try {
    // Сначала проверяем, загружены ли данные пользователя
    if (!authStore.user) {
      console.log('Загружаем данные пользователя...');
      await authStore.fetchCurrentUser();
    }

    console.log('Данные пользователя:', authStore.user);
    const userRole = authStore.user?.role as string | DirectusRole;
    console.log('Текущая роль пользователя:', userRole);
    
    if (!userRole) {
      console.error('Роль пользователя не определена');
      error.value = 'Ошибка при проверке прав доступа: роль пользователя не определена';
      return;
    }
    
    // Проверяем роль пользователя, учитывая что она может быть как строкой, так и объектом
    const roleName = typeof userRole === 'string' ? userRole : userRole.name;
    console.log('Имя роли:', roleName);
    
    if (!roleName) {
      console.error('Имя роли не определено');
      error.value = 'Ошибка при проверке прав доступа: имя роли не определено';
      return;
    }
    
    // Проверяем, является ли пользователь администратором, менеджером общежитий или администратором общежития
    // Учитываем возможные варианты написания ролей в Directus
    const allowedRoles = [
      'Administrator', '48db2cf1-656d-4f8a-abb2-97add6206f7e',
      'Dormitory Manager', '0f96c7fc-56f0-4834-8346-314273a98c7e',
    ];
    
    canDownloadFiles.value = allowedRoles.includes(roleName);
    console.log('Доступ к файлам:', canDownloadFiles.value ? 'разрешен' : 'запрещен');
    
    if (!canDownloadFiles.value) {
      error.value = 'У вас нет прав для скачивания файлов. Требуется роль администратора, менеджера общежитий или администратора общежития.';
    }
  } catch (e) {
    console.error('Ошибка при проверке роли:', e);
    error.value = 'Ошибка при проверке прав доступа';
  }
}

async function fetchRelocations() {
  loading.value = true;
  error.value = null;
  try {
    if (!authStore.access_token) {
      error.value = 'Необходима авторизация для получения данных о переселениях';
      return;
    }

    if (!canDownloadFiles.value) {
      error.value = 'У вас нет прав для скачивания файлов';
      return;
    }

    const response = await $fetch('/api/get_relocations/get_relocation_files', {
      method: 'POST',
      body: {
        access_token: authStore.access_token
      }
    });
    
    if (!response || !Array.isArray(response)) {
      throw new Error('Некорректный формат данных от сервера');
    }

    if (response.length === 0) {
      error.value = 'Нет доступных переселений для скачивания';
      return;
    }

    relocations.value = response.reduce((acc: Relocations, item: any) => {
      if (!item.relocation_applications_id_to?.student_relocation_id?.name) {
        console.warn('Пропущена запись с некорректными данными:', item);
        return acc;
      }

      if (item.status !== 'approved') {
        console.warn('Пропущена запись со статусом отличным от approved:', item);
        return acc;
      }
      console.log(item)
      const groupName = item.relocation_applications_id_to.student_relocation_id.name;
      const from = {
        fullName: `${item.relocation_applications_id_from?.user_created?.first_name || ''} ${item.relocation_applications_id_from?.user_created?.last_name || ''}`.trim(),
        email: item.relocation_applications_id_from?.user_created?.email || 'Не указан',
        phone: item.relocation_applications_id_from?.phone_number || 'Не указан',
        telegram: item.relocation_applications_id_from?.telegram || 'Не указан',
        accommodationFrom: item.relocation_applications_id_from?.student_accommodation_id_from?.name || 'Не указано',
        addressFrom: formatAddress(item.relocation_applications_id_from?.student_accommodation_from_address_id),
        apartmentFrom: item.relocation_applications_id_from?.apartment_number || 'Не указан',
        roomFrom: item.relocation_applications_id_from?.room_number || 'Не указан',
      };

      const to = {
        fullName: `${item.relocation_applications_id_to?.user_created?.first_name || ''} ${item.relocation_applications_id_to?.user_created?.last_name || ''}`.trim(),
        email: item.relocation_applications_id_to?.user_created?.email || 'Не указан',
        phone: item.relocation_applications_id_to?.user_created?.phone_number || 'Не указан',
        telegram: item.relocation_applications_id_to?.user_created?.telegram || 'Не указан',
        accommodationTo: item.relocation_applications_id_to?.student_accommodation_id_from?.name || 'Не указано',
        addressTo: formatAddress(item.relocation_applications_id_from?.student_accommodation_to_address_id),
        apartmentTo: item.relocation_applications_id_to?.apartment_number || 'Не указан',
        roomTo: item.relocation_applications_id_to?.room_number || 'Не указан',
      };

      // Определяем тип переселения
      const type: RelocationType = from.accommodationFrom === to.accommodationTo ? 'internal' : 'external';

      const relocationData: RelocationData = {
        from,
        to,
        type
      };

      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(relocationData);

      return acc;
    }, {});
  } catch (e: any) {
    console.error('Ошибка при получении данных:', e);
    error.value = e.message || 'Произошла ошибка при получении данных';
  } finally {
    loading.value = false;
  }
}

function formatAddress(address?: Address): string {
  return address ? `${address.city}, ${address.street} ${address.building_number}` : 'Адрес не указан';
}

function formatGroupName(groupName: string): string {
  return groupName.replace(/<\/?p>/g, '');
}

async function generateDOCX(from: FromUser, to: ToUser, type: 'internal' | 'external', isFrom = true) {
  const user = isFrom ? from : to;
  const accommodationFrom = isFrom ? from.accommodationFrom : to.accommodationTo;
  const addressFrom = isFrom ? from.addressFrom : to.addressTo;
  const apartmentFrom = isFrom ? from.apartmentFrom : to.apartmentTo;
  const roomFrom = isFrom ? from.roomFrom : to.roomTo;

  const paragraphs = [
    new Paragraph({
      text: "Заявление на переселение",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: type === 'internal'
        ? `Я, ${user.fullName}, прошу переселить меня из комнаты ${roomFrom} в квартире ${apartmentFrom} в комнату ${isFrom ? to.roomTo : from.roomFrom} в квартире ${isFrom ? to.apartmentTo : from.apartmentFrom} в том же общежитии "${accommodationFrom}".`
        : `Я, ${user.fullName}, прошу переселить меня из общежития "${accommodationFrom}", расположенного по адресу ${addressFrom}, квартира ${apartmentFrom}, комната ${roomFrom}.`,
      alignment: AlignmentType.JUSTIFIED,
    }),
    new Paragraph({ text: " " }),
    new Paragraph({ text: "Данные о студенте:", heading: "Heading2" }),
    new Paragraph(`ФИО: ${user.fullName}`),
    new Paragraph(`Почта: ${user.email}`),
    new Paragraph(`Телефон: ${user.phone}`),
    new Paragraph(`Telegram: ${user.telegram}`),
  ];

  if (type === 'external') {
    paragraphs.push(
      new Paragraph({ text: " " }),
      new Paragraph({ text: "Данные о новом размещении:", heading: "Heading2" }),
      new Paragraph(`Общежитие: ${isFrom ? to.accommodationTo : from.accommodationFrom}`),
      new Paragraph(`Адрес: ${isFrom ? to.addressTo : from.addressFrom}`),
      new Paragraph(`Квартира: ${isFrom ? to.apartmentTo : from.apartmentFrom}`),
      new Paragraph(`Комната: ${isFrom ? to.roomTo : from.roomFrom}`)
    );
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      },
    ],
  });
}

async function downloadDOCX(from: FromUser, to: ToUser, type: 'internal' | 'external') {
  if (!canDownloadFiles.value) {
    error.value = 'У вас нет прав для скачивания файлов';
    return;
  }

  console.log('Попытка скачивания файлов переселения. Роль пользователя:', authStore.user?.role);
  console.log('Тип переселения:', type);
  console.log('От:', from.fullName);
  console.log('Кому:', to.fullName);

  const docFrom = await generateDOCX(from, to, type, true);
  const docTo = await generateDOCX(from, to, type, false);

  const blobFrom = await Packer.toBlob(docFrom);
  const blobTo = await Packer.toBlob(docTo);

  const typeLabel = type === 'internal' ? 'внутреннее' : 'внешнее';
  saveAs(blobFrom, `Заявление_отправителя_${typeLabel}_${from.fullName}_${to.fullName}.docx`);
  saveAs(blobTo, `Заявление_получателя_${typeLabel}_${from.fullName}_${to.fullName}.docx`);
}

async function downloadGroupDOCX(groupName: string) {
  if (!canDownloadFiles.value) {
    error.value = 'У вас нет прав для скачивания файлов';
    return;
  }

  console.log('Попытка скачивания группы файлов переселения. Роль пользователя:', authStore.user?.role);
  console.log('Группа:', groupName);

  const group = relocations.value[groupName];
  const paragraphs = [
    new Paragraph({
      text: `Заявления на переселение: ${formatGroupName(groupName)}`,
      heading: "Heading1",
      alignment: "center"
    }),
  ];

  for (const [index, { from, to, type }] of group.entries()) {
    const typeLabel = type === 'internal' ? 'внутреннее' : 'внешнее';
    paragraphs.push(
      new Paragraph({ text: `Заявление на переселение #${index + 1} (${typeLabel}):`, heading: "Heading2" }),
      new Paragraph({ text: `${from.fullName} ↔ ${to.fullName}`, heading: "Heading3" }),
      new Paragraph(" "),
      new Paragraph({ text: "Данные о переселении:", heading: "Heading3" }),
      new Paragraph(`ФИО отправителя: ${from.fullName}`),
      new Paragraph(`Почта отправителя: ${from.email}`),
      new Paragraph(`Телефон отправителя: ${from.phone}`),
      new Paragraph(`Telegram отправителя: ${from.telegram}`),
      new Paragraph(" "),
      new Paragraph(`ФИО получателя: ${to.fullName}`),
      new Paragraph(`Почта получателя: ${to.email}`),
      new Paragraph(`Телефон получателя: ${to.phone}`),
      new Paragraph(`Telegram получателя: ${to.telegram}`),
      new Paragraph(" "),
      new Paragraph({
        text: type === 'internal'
          ? `Я, ${from.fullName}, прошу переселить меня из комнаты ${from.roomFrom} в квартире ${from.apartmentFrom} в комнату ${to.roomTo} в квартире ${to.apartmentTo} в том же общежитии "${from.accommodationFrom}".`
          : `Я, ${from.fullName}, прошу переселить меня из общежития "${from.accommodationFrom}", расположенного по адресу ${from.addressFrom}, квартира ${from.apartmentFrom}, комната ${from.roomFrom}, в общежитие "${to.accommodationTo}", расположенное по адресу ${to.addressTo}, квартира ${to.apartmentTo}, комната ${to.roomTo}.`,
        alignment: AlignmentType.JUSTIFIED,
      }),
      new Paragraph("------------------------------------------------------------"),
      new Paragraph(" "),
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Заявления_на_переселение_${groupName}.docx`);
}

async function downloadAllDOCX() {
  if (!canDownloadFiles.value) {
    error.value = 'У вас нет прав для скачивания файлов';
    return;
  }

  console.log('Попытка скачивания всех файлов переселения. Роль пользователя:', authStore.user?.role);

  const allGroups = Object.entries(relocations.value);
  
  for (const [groupName, group] of allGroups) {
    await downloadGroupDOCX(groupName.toString());
  }
}
</script>

<style scoped>
.card-hover {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-expansion-panel {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}
</style> 