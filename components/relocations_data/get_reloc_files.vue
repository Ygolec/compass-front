<template>
  <div>
    <button v-if="relocations && relocations.length" @click="downloadAllDOCX" class="download-all-btn">
      Скачать все DOCX
    </button>
    <div v-if="loading">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="relocations">
      <div v-for="(group, groupName) in relocations" :key="groupName">
        <h2>{{ groupName }}</h2>
        <button @click="downloadGroupDOCX(groupName)" class="download-group-btn">
          Скачать все документы для этой группы
        </button>
        <div v-for="(relocation, index) in group" :key="index">
          <h3>
            {{ relocation.from.fullName }} ({{ relocation.from.accommodationFrom }}) ↔
            {{ relocation.to.fullName }} ({{ relocation.to.accommodationTo }})
          </h3>
          <button @click="downloadDOCX(relocation.from, relocation.to)">Скачать оба документа</button>
        </div>
      </div>
    </div>
  </div>
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
        console.log(response);

        // Группируем по relocation_applications_id_to.student_relocation_id.name
        this.relocations = response.data.reduce((acc, item) => {
          const groupName = item.relocation_applications_id_to.student_relocation_id.name;
          const from = {
            fullName: `${item.relocation_applications_id_from.user_created.first_name} ${item.relocation_applications_id_from.user_created.last_name}`,
            email: item.relocation_applications_id_from.user_created.email,
            phone: item.relocation_applications_id_from.phone_number,
            telegram: item.relocation_applications_id_from.telegram,
            accommodationFrom: item.relocation_applications_id_from.student_accommodation_id_from.name,
            addressFrom: this.formatAddress(item.relocation_applications_id_from.student_accommodation_from_address_id),
            apartmentFrom: item.relocation_applications_id_from.apartment_number,
            roomFrom: item.relocation_applications_id_from.room_number,
          };

          const to = {
            fullName: `${item.relocation_applications_id_to.user_created.first_name} ${item.relocation_applications_id_to.user_created.last_name}`,
            email: item.relocation_applications_id_to.user_created.email,
            phone: item.relocation_applications_id_to.user_created.phone_number,
            telegram: item.relocation_applications_id_to.user_created.telegram,
            accommodationTo: item.relocation_applications_id_to.student_accommodation_id_to.name,
            addressTo: this.formatAddress(item.relocation_applications_id_to.student_accommodation_to_address_id),
            apartmentTo: item.relocation_applications_id_to.apartment_number,
            roomTo: item.relocation_applications_id_to.room_number,
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
        this.error = 'Ошибка при получении данных';
        console.error(err);
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
      const docFrom = this.generateDOCX(from, to, true); // Для отправителя
      const docTo = this.generateDOCX(from, to, false); // Для получателя

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
    // Вызываем fetchRelocations при монтировании компонента
    this.fetchRelocations();
  },
};
</script>

<style scoped>
.download-all-btn, .download-group-btn {
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
