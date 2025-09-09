<script setup>
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const { rooms, members, loader_object, companyId, isDark } = storeToRefs(store)
</script>

<template>

<div class="main-container" :class="{ 'half-white': !isDark}">
  <div class="grainy-container">
   
    <svg aria-hidden="true" width="0" height="0">
      <filter id="grainFilter" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="4" result="turbulence"/>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="300" xChannelSelector="R" yChannelSelector="G"/>
        <feBlend in2="SourceGraphic" mode="normal"/>
      </filter>
    </svg>

    <svg class="grainy-svg" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice">
        <defs>
          <!-- Dark center to create void -->
          <radialGradient id="blob-dark" cx="60%" cy="00%" r="55%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
  
           <radialGradient id="blob-dark2" cx="0%" cy="50%" r="55%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>

        <!-- Cyan right edge -->
        <radialGradient id="blob-cyan" cx="100%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#00ffff" />
          <stop offset="100%" stop-color="#00ffff" stop-opacity="0" />
        </radialGradient>

        <!-- Blue left edge -->
        <radialGradient id="blob-blue" cx="0%" cy="50%" r="80%">
          <stop offset="0%" stop-color="#1e3cff" />
          <stop offset="100%" stop-color="#1e3cff" stop-opacity="0" />
        </radialGradient>

      </defs>

      <!-- Blobs (order matters: dark last to appear on top) -->
      <rect width="1024" height="768" fill="url(#blob-cyan)" transform="rotate(15 1024)" filter="url(#grainFilter)" />
      <rect width="1024" height="768" fill="url(#blob-blue)" filter="url(#grainFilter)" />
      <rect width="1024" height="768" fill="url(#blob-dark)" filter="url(#grainFilter)" />
      <rect width="1000" height="1000" fill="url(#blob-dark2)" filter="url(#grainFilter)" />
    </svg>

</div>

<slot>

</slot>

</div>
</template>

<style scoped>
.main-container {
    position: relative;
    width: 100%;
    height: 100%;
}
.half-white {
  background-color: rgba(255, 255, 255, 0.34);
}
.grainy-container {
/* display: none; */
  width: 100%;
  height: 100%;
  background: black;
  overflow: hidden;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: -1; /* Ensure it stays behind other content */
}
.grainy-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
