<script setup>

import Button from 'primevue/button';
import { root_store } from '@/stores/root_store'
const store = root_store()

async function google_aignin() {
    await store.google_signin()
}
</script>

<template>
    <div class="card flex justify-center" style="padding: 2rem;">
        <Button icon="pi pi-google" label="Sign-In with google" @click="store.google_signin"/>
        <br><br>
        <Button icon="pi pi-google" label="Sign-Up with google" />
    </div>
</template>