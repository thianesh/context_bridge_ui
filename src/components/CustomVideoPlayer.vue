<template>
  <div class="relative w-full h-auto overflow-hidden bg-black rounded-xl">
    <!-- Video with native controls -->
    <video
      ref="videoRef"
      class="w-full h-full object-cover"
      controls
      @play="isPlaying = true"
      @pause="isPlaying = false"
      :src="src"
    ></video>

    <!-- Overlay with play button -->
    <transition name="fade">
      <div
        v-if="!isPlaying"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 violet-600"
      >
        <Button
          @click.stop="togglePlay" icon="pi pi-play" rounded severity="secondary"
          class="rounded-full bg-violet-600 hover:bg-violet-700 transition-all duration-300 flex items-center justify-center text-white text-3xl shadow-lg"
        >
          
        </Button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const videoRef = ref(null)
const isPlaying = ref(false)

const togglePlay = () => {
  const video = videoRef.value
  if (!video) return
  if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
