<!-- MeetReplica.vue -->
<template>
  <card class="flex flex-col">
    <!-- Top Bar -->
    <template #header>
    <div class="flex justify-between items-center p-4">
      <h1 class="text-lg font-semibold">Meet Replica</h1>
      <button @click="leaveCall" class="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Leave</button>
    </div>
    </template>

    <!-- Video Grid -->
    <template #content>
    <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-auto">
      <div
        v-for="(user, index) in users"
        :key="index"
        class="relative aspect-video bg-black rounded-lg shadow-md"
      >
        <video
          v-if="user.stream"
          :ref="el => attachStream(el, user.stream)"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover rounded-lg"
        ></video>
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
          No Video
        </div>
        <div class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-xs px-2 rounded">
          {{ user.name }}
        </div>
      </div>
    </div>
    </template>

    <!-- Control Bar -->
    <template #footer>
    <div class="flex justify-center items-center gap-6 py-4">
      <button @click="toggleMic" class="bg-gray-700 p-2 rounded-full hover:bg-gray-600">
        <span v-if="micOn">🎤</span>
        <span v-else>🔇</span>
      </button>
      <button @click="toggleCamera" class="bg-gray-700 p-2 rounded-full hover:bg-gray-600">
        <span v-if="cameraOn">📷</span>
        <span v-else>🚫</span>
      </button>
    </div>
    </template>
  </card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const micOn = ref(true)
const cameraOn = ref(true)

const localStream = ref(null)
const users = ref([
  { name: 'You', stream: null },
  { name: 'User 2', stream: null },
])

const attachStream = (videoElement, stream) => {
  if (videoElement && stream) {
    videoElement.srcObject = stream
  }
}

const toggleMic = () => {
  micOn.value = !micOn.value
  if (localStream.value) {
    localStream.value.getAudioTracks().forEach(track => (track.enabled = micOn.value))
  }
}

const toggleCamera = () => {
  cameraOn.value = !cameraOn.value
  if (localStream.value) {
    localStream.value.getVideoTracks().forEach(track => (track.enabled = cameraOn.value))
  }
}

const leaveCall = () => {
  alert('Leaving call')
  // implement actual leave logic here
}

onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStream.value = stream
    users.value[0].stream = stream
  } catch (err) {
    console.error('Error accessing media devices:', err)
  }
})
</script>

<style scoped>
/* Optional styling enhancements */
</style>
