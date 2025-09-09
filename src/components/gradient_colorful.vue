<template>
  <div class="grainy-container">
    <svg aria-hidden="true" width="0" height="0">
      <filter id="grainFilter" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="4" result="turbulence"/>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="300" xChannelSelector="R" yChannelSelector="G"/>
        <feBlend in2="SourceGraphic" mode="normal"/>
      </filter>
    </svg>

    <svg class="grainy-svg" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice">
      <defs>
        <!-- Color blobs -->
        <radialGradient id="blob-cyan" cx="20%" cy="10%" r="60%">
          <stop offset="0%" stop-color="#5cd1d1" />
          <stop offset="100%" stop-color="#5cd1d1" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blob-orange" cx="75%" cy="20%" r="60%">
          <stop offset="0%" stop-color="#f0d45b" />
          <stop offset="100%" stop-color="#f0d45b" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blob-pink" cx="85%" cy="85%" r="65%">
          <stop offset="0%" stop-color="#e91e63" />
          <stop offset="100%" stop-color="#e91e63" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blob-indigo" cx="10%" cy="90%" r="50%">
          <stop offset="0%" stop-color="#1b1c2e" />
          <stop offset="100%" stop-color="#1b1c2e" stop-opacity="0" />
        </radialGradient>

        <!-- Neutral fillers -->
        <radialGradient id="blob-grey1" cx="50%" cy="20%" r="30%">
          <stop offset="0%" stop-color="#444" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#444" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blob-grey2" cx="35%" cy="70%" r="25%">
          <stop offset="0%" stop-color="#222" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#222" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="blob-grey3" cx="60%" cy="60%" r="20%">
          <stop offset="0%" stop-color="#666" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#666" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Colored blob layers -->
      <rect width="1024" height="768" fill="url(#blob-cyan)" filter="url(#grainFilter)" />
      <rect width="1024" height="768" fill="url(#blob-orange)" filter="url(#grainFilter)" />
      <rect width="1024" height="768" fill="url(#blob-pink)" filter="url(#grainFilter)" />
      <rect width="1200" height="768" fill="url(#blob-indigo)" filter="url(#grainFilter)" />

      <!-- Neutral blob layers -->
      <!-- <rect width="1200" height="768" fill="url(#blob-grey1)" filter="url(#grainFilter)" />
      <rect width="1200" height="768" fill="url(#blob-grey2)" filter="url(#grainFilter)" />
      <rect width="1200" height="768" fill="url(#blob-grey3)" filter="url(#grainFilter)" /> -->

      <!-- Optional text -->
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-size="100" font-weight="700"
            fill="rgba(0,0,0,0.25)" style="mix-blend-mode: multiply;">
        fractalNoise
      </text>
    </svg>
  </div>
</template>

<script setup>
// No dynamic script needed
</script>

<style scoped>
.grainy-container {
  width: 100%;
  height: 100vh;
  background: black;
  overflow: hidden;
}
.grainy-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
