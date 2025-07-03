# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## ChatWidget Component

`ChatWidget.vue` provides a small chat interface built with PrimeVue components.

### Basic usage

```vue
<template>
  <ChatWidget ref="chat" v-model="messages" :loading="loading" @send="onSend" />
</template>

<script setup>
import { ref } from 'vue'
import ChatWidget from '@/components/ChatWidget.vue'

const messages = ref([])
const loading = ref(false)

function onSend(text) {
  // handle outgoing message
}
</script>
```

The component exposes an `addMessage` method via `ref` so you can add incoming
messages programmatically:

```js
const chat = ref()
chat.value.addMessage('Hello from server')
```
