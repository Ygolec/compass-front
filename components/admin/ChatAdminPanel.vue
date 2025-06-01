<template>
  <v-card class="pa-4"  outlined>
    <v-card-title>Умный поиск</v-card-title>
    <v-card-subtitle>Задайте вопрос и получите ответ на основе документов</v-card-subtitle>
    <v-divider></v-divider>
    <v-card-text class="chat-history" ref="chatHistoryRef">
      <div v-for="(msg, idx) in messages" :key="idx" class="d-flex mb-2" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
        <v-sheet :color="msg.role === 'user' ? 'primary lighten-4' : 'grey lighten-3'" class="pa-3" rounded>
          <div class="text-sm-h5">{{ msg.content }}</div>
          <div v-if="msg.role === 'assistant' && msg.documents?.length" class="mt-2">
            <div class="text-caption font-weight-bold">Документы, которые использовались:</div>
            <v-list dense>
              <v-list-item v-for="(doc, dIdx) in msg.documents" :key="dIdx" :href="doc.url" target="_blank">
                <v-list-item-title>{{ doc.source }}</v-list-item-title>
                <v-list-item-subtitle>Страница:{{ doc.page }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-sheet>
      </div>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-text-field
        v-model="input"
        label="Введите сообщение..."
        @keyup.enter="sendMessage"
        :disabled="loading"
        hide-details
        class="flex-grow-1"
      />
      <v-btn color="primary" :loading="loading" @click="sendMessage" :disabled="!input || loading">
        Отправить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { VCard, VCardTitle, VCardText, VCardActions, VDivider, VTextField, VBtn, VSheet, VList, VListItem, VListItemTitle } from 'vuetify/components';
const config = useRuntimeConfig()

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  documents?: { source: string; url: string;page:number }[];
}

const messages = ref<ChatMessage[]>([]);
const input = ref('');
const loading = ref(false);
const chatHistoryRef = ref<HTMLElement | null>(null);

async function sendMessage() {
  if (!input.value.trim()) return;
  const userMsg: ChatMessage = { role: 'user', content: input.value };
  messages.value.push(userMsg);
  loading.value = true;
  const userInput = input.value;
  input.value = '';
  await nextTick();
  scrollToBottom();
  try {
    const res = await fetch(`${config.RAG_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "question": userInput, "directory":'work_documents'})
    });
    if (!res.ok) throw new Error('Ошибка ответа от сервера');
    const data = await res.json();
    if (data.answer)
      data.source_documents = data.source_documents.map((doc: any) => ({
        ...doc,
        url: `${config.RAG_URL}/download/work_documents/${doc.source}`,
      }));

    messages.value.push({
      role: 'assistant',
      content: data.answer,
      documents: data.source_documents || []
    });
    await nextTick();
    scrollToBottom();
  } catch (e) {
    messages.value.push({ role: 'assistant', content: 'Ошибка получения ответа от модели.' });
  } finally {
    loading.value = false;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
.chat-history {
  height: 400px;
  overflow-y: auto;
  background: #fafafa;
  margin-bottom: 8px;
}
.justify-end {
  justify-content: flex-end;
}
.justify-start {
  justify-content: flex-start;
}
</style>

