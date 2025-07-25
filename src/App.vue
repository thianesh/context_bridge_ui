<script setup>
import { useDialog } from 'primevue';
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, onMounted, computed, watch } from 'vue';
import sidebar from './components/sidebar.vue';
import rightbar from './components/rightbar.vue';
import HomeView from './views/HomeView.vue';
import { useStorage } from '@vueuse/core'
import loader from './components/loader.vue';
import router from '@/router';

const route = useRoute()
const isHomeRoute = computed(() => route.path === '/')


import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const { rooms, members, loader_object, companyId, isDark } = storeToRefs(store)

async function get_members() {
  members.value = await store.get_members()
  store.get_companies()
}

function get_rooms() {
  store.get_rooms()
}
onMounted(() => {
  let is_dark_already = document.documentElement.classList.contains('my-app-dark');
  if (isDark.value != is_dark_already) toggleDarkMode()

  if (!members.value?.length) {
    get_members()
  }
  if (!rooms.value?.length) {
    get_rooms()
  }

  if (window.electronAPI) {
    // Listen for heartbeat from backend
    window.electronAPI.onBackendHeartbeat((msg) => {
      // console.log("💓 Message:", msg);
    });

    // Send heartbeat to backend every 5s
    setInterval(() => {
      console.log("💓 Sending heartbeat to backend...");
      // window.electronAPI.sendHeartbeat();
    }, 5000);
  }
  else {
    // console.warn('⚠️ electronAPI is undefined');
    console.warn('⚠️ You are using web version.');
  }

});

function toggleDarkMode() {
  isDark.value = document.documentElement.classList.toggle('my-app-dark');
}

const parent = ref()
const center = ref()
const right_comp = ref()
const left_bar_state = ref('closed');
const right_bar_state = ref('closed');

function open_leftbar() {
  close_rightbar()
  left_bar_state.value = 'open'
  parent.value.style.gridTemplateColumns = '200px auto 0px';
  parent.value.style.gap = '1rem';
  parent.value.style.transition = 'all 0.3s ease-in-out';
}

function close_leftbar() {
  left_bar_state.value = 'closed'
  parent.value.style.gridTemplateColumns = '0px auto 0px';
  parent.value.style.gap = '0rem';
  parent.value.style.transition = 'all 0.3s ease-in-out';
}
function open_rightbar() {
  close_leftbar();

  right_bar_state.value = 'open';

  parent.value.style.gridTemplateColumns = '0px auto 0px';
  parent.value.style.gap = '1rem';
  parent.value.style.transition = 'all 0.3s ease-in-out';

  right_comp.value.style.transition = 'all 0.3s ease-in-out';
  right_comp.value.style.minWidth = '300px';
  right_comp.value.style.opacity = '1';
  right_comp.value.style.transform = 'translateX(-300px)';

  center.value.style.transform = 'translateX(-300px)';
  center.value.style.transition = 'all 0.3s ease-in-out';
}
function close_rightbar() {
  right_bar_state.value = 'closed'
  parent.value.style.gridTemplateColumns = '0px auto 0px';
  parent.value.style.gap = '0rem';
  parent.value.style.transition = 'all 0.3s ease-in-out';
  center.value.style.transform = 'translateX(0px)';
  right_comp.value.style.transition = 'all 0s';
  right_comp.value.style.minWidth = '0px';
  right_comp.value.style.opacity = '0';
}
</script>

<template>

  <div class="parent" ref="parent">

    <!-- section left -->
    <div class="left-container">
      <sidebar></sidebar>
    </div>
    <!-- main container -->
    <div class="main-container" ref="center">

      <div :style="{
        visibility: isHomeRoute ? 'visible' : 'hidden',
        position: isHomeRoute ? 'static' : 'fixed',
      }">
        <HomeView />
      </div>
      <RouterView />

    </div>

    <!-- right container -->
    <div class="right-container" ref="right_comp">
      <rightbar></rightbar>
    </div>
  </div>

  <div style="position: fixed;right: 2rem;top: 2rem;">
    <Button v-show="isDark" label="" icon="pi pi-moon" @click="toggleDarkMode()" size="small" />
    <Button v-show="!isDark" label="" icon="pi pi-sun" @click="toggleDarkMode()" size="small" />
  </div>

   <div style="position: fixed;right: 5rem;top: 2rem;" class="mobile-menu">
    <Button label="input settings" icon="pi pi-camera" severity="secondary" v-if="right_bar_state == 'closed'" @click="open_rightbar()" size="small" />
    <Button label="input settings" icon="pi pi-camera" severity="danger" v-else @click="close_rightbar()" size="small" />
  </div>

  <div style="position: fixed;left: 2rem;top: 2rem;" class="mobile-menu">
    <Button label="other settings" icon="pi pi-arrow-right" severity="secondary" v-if="left_bar_state == 'closed'" @click="open_leftbar()" size="small" />
    <Button label="other settings" icon="pi pi-arrow-left" severity="danger" v-else @click="close_leftbar()" size="small" />
  </div>

  <loader v-if="loader_object.length > 0"></loader>

  <img src="/logo.svg" alt="" style="position: fixed;width:50px;height: 50px;bottom: 1rem;right: 1rem;">

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
  min-width: 300px;
}

.left-container {
  max-width: 300px;
  width: 100%;
  overflow: hidden;
}

.right-container {
  max-width: 300px;
  width: 100%;
  overflow: hidden;
}

.mobile-menu {
  display: none;
}

@media screen and (max-width: 1453px) {
 .parent {
  grid-template-columns: 0px 1fr 0px;
  gap: 0rem;
  margin-top: 5rem;
  }
  .right-container {
    /* transform: translateX(350px) */
    opacity: 0;
  }
  .mobile-menu{
    display: block;
  }
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
