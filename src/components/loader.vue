
<template>
    <div class="back_drop"></div>
    <div class="card flex justify-center spinner">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
            animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <br><br>
    </div>
    <Message severity="secondary message">
        <p v-for="message in loader_object">
            {{ message.message }}
        </p>
    </Message>
</template>

<script setup>
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {loader_object} = storeToRefs(store)
</script>

<style scoped>
.spinner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.message {
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: 5rem;
    transform: translate(-50%, -50%);
}
.back_drop {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background-color: var(--p-content-background);
    opacity: 0.5;
}
</style>
