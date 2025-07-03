<template>
  <Card class="chat-widget">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-comments" /> Chat
      </div>
    </template>
    <template #content>
      <ScrollPanel ref="scrollPanel" style="height: 300px" class="p-3 border rounded-sm surface-0">
        <ul class="list-none m-0 p-0 flex flex-col gap-2">
          <li v-for="(msg, index) in messages" :key="index" :class="msg.self ? 'text-right' : 'text-left'">
            <div
              class="inline-block px-3 py-2 rounded-md"
              :class="msg.self ? 'bg-primary-600 text-white' : 'surface-200'"
            >
              {{ msg.text }}
            </div>
          </li>
        </ul>
        <div v-if="loading" class="flex justify-center py-2">
          <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8" fill="transparent"/>
        </div>
      </ScrollPanel>
      <div class="flex gap-2 mt-3">
        <InputText v-model="input" @keydown.enter="onSend" class="flex-auto" placeholder="Type a message" />
        <Button label="Send" icon="pi pi-send" @click="onSend" :disabled="input.trim()==='' || loading" />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'send'])

const messages = ref([...props.modelValue])
const input = ref('')
const scrollPanel = ref()

watch(() => props.modelValue, val => { messages.value = [...val] })
watch(messages, async () => {
  await nextTick()
  scrollPanel.value?.moveScrollTop(scrollPanel.value.getScrollHeight())
})

function addMessage(text, self = false) {
  messages.value.push({ text, self })
}

function onSend() {
  if (input.value.trim() === '') return
  emit('send', input.value)
  addMessage(input.value, true)
  emit('update:modelValue', messages.value)
  input.value = ''
}

defineExpose({ addMessage })
</script>

<style scoped>
.chat-widget {
  width: 100%;
}
</style>
