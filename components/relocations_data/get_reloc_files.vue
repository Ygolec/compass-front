<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card v-if="relocations && relocations.length" class="mb-4">
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

        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          size="64"
          class="ma-auto"
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
            :key="groupName"
            class="mb-4"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-account-group</v-icon>
                {{ groupName.replace(/<\/?p>/g, '') }}
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-file-download"
                class="mb-4"
                @click="downloadGroupDOCX(groupName)"
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
                  <v-card class="h-100">
                    <v-card-title class="text-subtitle-1">
                      <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
                      Переселение #{{ index + 1 }}
                    </v-card-title>
                    <v-card-text>
                      <v-list>
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
                        @click="downloadDOCX(relocation.from, relocation.to)"
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      relocations: null,
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchRelocations() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/api/get_relocations/get_relocation_files');
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Некорректный формат данных от сервера');
        }

        this.relocations = response.data.reduce((acc, item) => {
          if (!item.relocation_applications_id_to?.student_relocation_id?.name) {
            console.warn('Пропущена запись с некорректными данными:', item);
            return acc;
          }

          if (item.status !== 'approved') {
            console.warn('Пропущена запись со статусом отличным от approved:', item);
            return acc;
          }

          const groupName = item.relocation_applications_id_to.student_relocation_id.name;
          const from = {
            fullName: `${item.relocation_applications_id_from?.user_created?.first_name || ''} ${item.relocation_applications_id_from?.user_created?.last_name || ''}`.trim(),
            email: item.relocation_applications_id_from?.user_created?.email || 'Не указан',
            phone: item.relocation_applications_id_from?.phone_number || 'Не указан',
            telegram: item.relocation_applications_id_from?.telegram || 'Не указан',
            accommodationFrom: item.relocation_applications_id_from?.student_accommodation_id_from?.name || 'Не указано',
            addressFrom: this.formatAddress(item.relocation_applications_id_from?.student_accommodation_from_address_id),
            apartmentFrom: item.relocation_applications_id_from?.apartment_number || 'Не указан',
            roomFrom: item.relocation_applications_id_from?.room_number || 'Не указан',
          };

          const to = {
            fullName: `${item.relocation_applications_id_to?.user_created?.first_name || ''} ${item.relocation_applications_id_to?.user_created?.last_name || ''}`.trim(),
            email: item.relocation_applications_id_to?.user_created?.email || 'Не указан',
            phone: item.relocation_applications_id_to?.user_created?.phone_number || 'Не указан',
            telegram: item.relocation_applications_id_to?.user_created?.telegram || 'Не указан',
            accommodationTo: item.relocation_applications_id_to?.student_accommodation_id_to?.name || 'Не указано',
            addressTo: this.formatAddress(item.relocation_applications_id_to?.student_accommodation_to_address_id),
            apartmentTo: item.relocation_applications_id_to?.apartment_number || 'Не указан',
            roomTo: item.relocation_applications_id_to?.room_number || 'Не указан',
          };

          const relocationData = {
            from,
            to,
          };

          if (!acc[groupName]) {
            acc[groupName] = [];
          }
          acc[groupName].push(relocationData);

          return acc;
        }, {});
      } catch (err) {
        console.error('Ошибка при получении данных:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 503) {
            this.error = 'Сервер Directus недоступен. Пожалуйста, попробуйте позже.';
          } else if (err.response?.status === 500) {
            this.error = 'Ошибка на сервере. Пожалуйста, обратитесь к администратору.';
          } else {
            this.error = err.response?.data?.message || 'Ошибка при получении данных';
          }
        } else {
          this.error = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
        }
      } finally {
        this.loading = false;
      }
    },

    formatAddress(address) {
      return address ? `${address.city}, ${address.street} ${address.building_number}` : 'Адрес не указан';
    },

    generateDOCX(from, to, isFrom = true) {
      const user = isFrom ? from : to;
      const accommodationFrom = isFrom ? from.accommodationFrom : to.accommodationTo;
      const addressFrom = isFrom ? from.addressFrom : to.addressTo;
      const apartmentFrom = isFrom ? from.apartmentFrom : to.apartmentTo;
      const roomFrom = isFrom ? from.roomFrom : to.roomTo;

      return new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({ text: "Заявление на переселение", heading: "Heading1" }),
              new Paragraph({ text: `Я, ${user.fullName}, прошу переселить меня из общежития "${accommodationFrom}", расположенного по адресу ${addressFrom}, квартира ${apartmentFrom}, комната ${roomFrom}.`, alignment: "Left" }),
              new Paragraph(" "),
              new Paragraph({ text: "Данные о студенте:", heading: "Heading2" }),
              new Paragraph(`ФИО: ${user.fullName}`),
              new Paragraph(`Почта: ${user.email}`),
              new Paragraph(`Телефон: ${user.phone}`),
              new Paragraph(`Telegram: ${user.telegram}`),
            ],
          },
        ],
      });
    },

    async downloadDOCX(from, to) {
      const docFrom = this.generateDOCX(from, to, true);
      const docTo = this.generateDOCX(from, to, false);

      const blobFrom = await Packer.toBlob(docFrom);
      const blobTo = await Packer.toBlob(docTo);

      saveAs(blobFrom, `Заявление_отправителя_${from.fullName}_${to.fullName}.docx`);
      saveAs(blobTo, `Заявление_получателя_${from.fullName}_${to.fullName}.docx`);
    },

    async downloadGroupDOCX(groupName) {
      const group = this.relocations[groupName];
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: group.flatMap(({ from, to }, index) => [
              new Paragraph({ text: `Заявление на переселение #${index + 1}:`, heading: "Heading1" }),
              new Paragraph({ text: `${from.fullName} (из ${from.accommodationFrom}) ↔ ${to.fullName} (в ${to.accommodationTo})`, bold: true }),
              new Paragraph(" "),
              new Paragraph({ text: "Данные о переселении:", heading: "Heading2" }),
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
              new Paragraph(`Я, ${from.fullName}, прошу переселить меня из общежития "${from.accommodationFrom}", расположенного по адресу ${from.addressFrom}, квартира ${from.apartmentFrom}, комната ${from.roomFrom}, в общежитие "${to.accommodationTo}", расположенное по адресу ${to.addressTo}, квартира ${to.apartmentTo}, комната ${to.roomTo}.`),
              new Paragraph("------------------------------------------------------------"),
              new Paragraph(" "),
            ]),
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Заявления_на_переселение_${groupName}.docx`);
    },
  },
  mounted() {
    this.fetchRelocations();
  },
};
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}

.v-expansion-panel {
  border-radius: 8px;
  overflow: hidden;
}
</style>
