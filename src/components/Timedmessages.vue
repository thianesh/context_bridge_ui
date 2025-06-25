<template>
  <div v-if="currentMessage" class="text-center p-4 text-lg font-medium">
    <Message :severity="messageSeverity">{{ currentMessage }}</Message>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true,
    validator: (val) =>
      val.every(
        (item) => typeof item.message === 'string' && typeof item.timeout === 'number'
      ),
  },
})

const currentMessage = ref('')
const messageSeverity = ref('')
let timeouts = []

function startTimedMessages() {
  clearAllTimeouts()
  currentMessage.value = ''

  for (const { message, timeout, severity = 'info' } of props.messages) {
    const id = setTimeout(() => {
      currentMessage.value = message
      messageSeverity.value = severity; 
    }, timeout * 1000)
    timeouts.push(id)
  }
}

function clearAllTimeouts() {
  timeouts.forEach(clearTimeout)
  timeouts = []
}

onMounted(startTimedMessages)
onBeforeUnmount(clearAllTimeouts)

// Re-run when prop changes (optional, for reactivity)
watch(() => props.messages, () => {
  startTimedMessages()
}, { deep: true })
</script>
