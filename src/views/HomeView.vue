<script setup>
import DatePicker from 'primevue/datepicker';
import { ref, onMounted } from "vue";

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {session_data} = storeToRefs(store)

import { useRouter } from 'vue-router';

const date = ref();

</script>

<template>
  <main>
    <span>User logged In {{ session_data?.data?.session?.user.user_metadata.full_name }}</span>
  </main>
</template>
