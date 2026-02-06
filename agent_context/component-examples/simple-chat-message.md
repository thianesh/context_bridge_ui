# Simple Component Example - Chat Message

This is a simple presentational component that receives props and displays data.

```vue
<script setup>
// Define props with types
const props = defineProps({
  username: String,
  message: String,
  time: String,
  isYou: Boolean
})
</script>

<template>
  <div
    class="flex items-end mb-3"
    :class="isYou ? 'justify-end' : 'justify-start'"
  >
    <!-- Message Bubble -->
    <div
      class="max-w-xs sm:max-w-md px-4 py-2 rounded-2xl shadow-md"
      :style="{
        background: isYou ? 'var(--p-button-primary-background)' : 'var(--p-button-secondary-background)',
        color: isYou ? 'var(--p-button-primary-color)' : 'var(--p-button-secondary-color)'
      }"
    >
      <div class="text-lg font-semibold mb-1">
        {{ username }}
      </div>
      <div class="text-base break-words whitespace-pre-wrap">
        {{ message }}
      </div>
      <div class="text-xs text-right mt-2">
        {{ time }}
      </div>
    </div>
  </div>
</template>
```

## Usage

```vue
<script setup>
import ChatMessage from '@/components/ChatMessage.vue'
import { ref } from 'vue'

const messages = ref([
  {
    id: 1,
    username: 'John Doe',
    message: 'Hello everyone!',
    time: '10:30 AM',
    isYou: false
  },
  {
    id: 2,
    username: 'You',
    message: 'Hi John!',
    time: '10:31 AM',
    isYou: true
  }
])
</script>

<template>
  <div>
    <ChatMessage
      v-for="msg in messages"
      :key="msg.id"
      :username="msg.username"
      :message="msg.message"
      :time="msg.time"
      :isYou="msg.isYou"
    />
  </div>
</template>
```

## Key Patterns

1. **Props Definition**: Simple prop types
2. **Conditional Classes**: Using `:class` with ternary operator
3. **Dynamic Styling**: Using CSS variables for theming
4. **Responsive Design**: Tailwind CSS classes
5. **Text Handling**: `break-words` and `whitespace-pre-wrap` for proper text display
