<script setup>

import Button from 'primevue/button';
import { onMounted, watch, ref } from 'vue';
import router from '@/router';

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const { session_data, members, 
  display_preference, rooms, members_updated } = storeToRefs(store)


async function google_aignin() {
    await store.google_signin()
}

onMounted(() => {

    watch(session_data, ()=> {
        if(session_data.value?.data?.session) {
            router.push('/')
        }
    })
})

const email = ref("")
const pass = ref("")

async function signInWithEmail(){
    await store.signInWithEmail(email.value, pass.value)
}
</script>

<template>
    <div class="card flex justify-center" style="padding: 2rem;width: 100%;">
        <Button icon="pi pi-google" label="Sign-In or Sign-up with google" style="margin: auto;" @click="store.google_signin"/>
    </div>
    <!-- <div class="flex flex-col gap-2">
    <label for="username">Email</label>
    <InputText id="username" v-model="email" aria-describedby="username-help" />
    <label for="pass">Password</label>
    <InputText id="pass" v-model="pass" aria-describedby="username-help" />
    <Button label="Sign-in" @click="signInWithEmail"></Button>
</div> -->
</template>