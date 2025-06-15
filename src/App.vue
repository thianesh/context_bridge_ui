<script setup>
import { useDialog } from 'primevue';
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue';
import sidebar from './components/sidebar.vue';
import rightbar from './components/rightbar.vue';
import HomeView from './views/HomeView.vue';
import { useStorage } from '@vueuse/core'
import loader from './components/loader.vue';

const isDark = useStorage('theme', false) 

const route = useRoute()
const isHomeRoute = computed(() => route.path === '/')


import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {rooms, members, loader_object} = storeToRefs(store)

async function get_members(){
  members.value = await store.get_members()
}

function get_rooms(){
    store.get_rooms()
}
onMounted(() => {
    let is_dark_already = document.documentElement.classList.contains('my-app-dark');
    if(isDark.value != is_dark_already) toggleDarkMode()

    if(!members.value?.length) {
        get_members()
    }
    if(!rooms.value?.length) {
      get_rooms()
    }
  });

function toggleDarkMode() {
  isDark.value = document.documentElement.classList.toggle('my-app-dark');
}
</script>

<template>

  <div class="parent">

    <!-- section left -->
    <div class="left-container">
      <sidebar></sidebar>
    </div>
    <!-- main container -->
     <div class="main-container">

        <div :style="{ 
          visibility: isHomeRoute ? 'visible' : 'hidden',
          position: isHomeRoute ? 'static' : 'fixed',
            }">
          <HomeView />
        </div>
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

    <loader v-if="loader_object.length > 0"></loader>
  
</template>

<style scoped>
.parent {
  display: grid;
  grid-template-columns: auto 1fr auto;
  width: 100%;
  max-width: 2000px;
  margin: auto;
  gap: 4rem;
}
.main-container {
  width: 100%;
  max-width: 1600px;
  overflow: auto;
}
.left-container {
  max-width: 200px;
  width: 100%;
}
.right-container {
  max-width: 200px;
  width: 100%;
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
