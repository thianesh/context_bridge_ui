<script setup>
import { useDialog } from 'primevue';
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue';
import sidebar from './components/sidebar.vue';
import rightbar from './components/rightbar.vue';
const isDark = ref(false);

onMounted(() => {
      isDark.value = document.documentElement.classList.contains('my-app-dark');
    });

function toggleDarkMode() {
  isDark.value = document.documentElement.classList.toggle('my-app-dark');
}
</script>

<template>

  <div class="parent">

    <div :class="{ 'background': isDark, 'white': !isDark}"></div>
    <!-- section left -->
    <div class="left-container">
      <sidebar></sidebar>
    </div>
    <!-- main container -->
     <div class="main-container">
        <RouterView/>

      </div>
      
      <!-- right container -->
      <div class="right-container">
        <rightbar></rightbar>
      </div>
    </div>
    
    <div style="position: fixed;right: 2rem;top: 2rem;">
      <Button v-show="isDark" label="" icon="pi pi-moon" @click="toggleDarkMode()" size="small"/>
      <Button v-show="!isDark" label="" icon="pi pi-sun" @click="toggleDarkMode()" size="small"/>
    </div>
  
</template>

<style scoped>
.parent {
  display: grid;
  grid-template-columns: auto auto auto;
  width: 100%;
  max-width: 1400px;
  margin: auto;
  gap: 4rem;
}
.main-container {
  width: 100%;
  max-width: 1000px;
}
.left-container {
  max-width: 200px;
}
.right-container {
  max-width: 200px;
}
.background {
  z-index: -100;
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  background-color: var(--p-surface-950);
}

.white {
  z-index: -100;
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  background-color: white;
}

</style>
