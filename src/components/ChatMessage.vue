<template>
  <div
    class="flex items-end mb-3"
    :class="isYou ? 'justify-end' : 'justify-start'"
  >
    <!-- Avatar for other user -->
    <!-- <div
      v-if="!isYou"
      class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold mr-2 shrink-0"
    >
      {{ username.charAt(0).toUpperCase() }}
    </div> -->

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

    <!-- Avatar for you (optional; hide if you don't want it) -->
    <!-- <div
      v-if="isYou"
      class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold ml-2 shrink-0"
    >
      {{ username.charAt(0).toUpperCase() }}
    </div> -->
  </div>
</template>

<script setup>
defineProps({
  username: String,
  message: String,
  time: String,
  isYou: Boolean
})
</script>
