<template>
  <div>
    <!-- Выводим relocations для отладки -->
    <div v-if="relocations">
      <pre>{{ relocations }}</pre>
    </div>

    <button v-if="relocations && relocations.length" @click="downloadAllDOCX" class="download-all-btn">
      Скачать все DOCX
    </button>
    <div v-if="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="relocations">
      <div v-for="(relocation, index) in relocations" :key="index">
        <h3>
          {{ relocation.from.fullName }} ({{ relocation.from.accommodationFrom }}) ↔
          {{ relocation.to.fullName }} ({{ relocation.to.accommodationTo }})
        </h3>
        <button @click="downloadDOCX(relocation.from, relocation.to)">Скачать DOCX</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Document, Packer, Paragraph, TextRun } from 'docx';
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
        this.relocations = response.data.map(item => ({
          from: {
            fullName: `${item.relocation_applications_id_from.user_created.first_name} ${item.relocation_applications_id_from.user_created.last_name}`,
            email: item.relocation_applications_id_from.user_created.email,
            phone: item.relocation_applications_id_from.user_created.phone_number,
            telegram: item.relocation_applications_id_from.user_created.telegram,
            accommodationFrom: item.relocation_applications_id_from.student_accommodation_id_from.name,
            addressFrom: this.formatAddress(item.relocation_applications_id_from.student_accommodation_from_address_id),
            apartmentFrom: item.relocation_applications_id_from.apartment_number,
            roomFrom: item.relocation_applications_id_from.room_number,
          },
          to: {
            fullName: `${item.relocation_applications_id_to.user_created.first_name} ${item.relocation_applications_id_to.user_created.last_name}`,
            email: item.relocation_applications_id_to.user_created.email,
            phone: item.relocation_applications_id_to.user_created.phone_number,
            telegram: item.relocation_applications_id_to.user_created.telegram,
            accommodationTo: item.relocation_applications_id_to.student_accommodation_id_to.name,
            addressTo: this.formatAddress(item.relocation_applications_id_to.student_accommodation_to_address_id),
            apartmentTo: item.relocation_applications_id_to.apartment_number,
            roomTo: item.relocation_applications_id_to.room_number,
          },
        }));
      } catch (err) {
        this.error = 'Ошибка при получении данных';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    formatAddress(address) {
      return address ? `${address.city}, ${address.street} ${address.building_number}` : 'Адрес не указан';
    },

    generateDOCX(from, to) {
      return new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({ text: "Заявление на переселение", heading: "Heading1" }),
              new Paragraph({ text: `Я, ${from.fullName}, прошу переселить меня из общежития "${from.accommodationFrom}", расположенного по адресу ${from.addressFrom}, квартира ${from.apartmentFrom}, комната ${from.roomFrom}, в общежитие "${to.accommodationTo}", расположенное по адресу ${to.addressTo}, квартира ${to.apartmentTo}, комната ${to.roomTo}.`, alignment: "Left" }),
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
            ],
          },
        ],
      });
    },

    async downloadDOCX(from, to) {
      const doc = this.generateDOCX(from, to);
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Заявление_на_переселение_${from.fullName}_${to.fullName}.docx`);
    },

    async downloadAllDOCX() {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: this.relocations.flatMap(({ from, to }, index) => [
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
      saveAs(blob, "Заявления_на_переселение_все.docx");
    },
  },
  mounted() {
    // Вызываем fetchRelocations при монтировании компонента
    this.fetchRelocations();
  },
};
</script>

<style scoped>
.download-all-btn {
  margin-bottom: 20px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
}
.error {
  color: red;
}
</style>
