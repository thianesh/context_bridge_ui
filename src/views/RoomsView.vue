<script setup>
    import { ref } from 'vue';

    const value = ref(null);
</script>
<template>
    <div class="card flex justify-center">
        <div class="flex flex-col gap-2">
            <label for="username">Room name</label><br>
            <InputText id="username" v-model="value" aria-describedby="username-help" />
            <Message size="small" severity="secondary" variant="simple">Name of the room you wanted to create.</Message>
        </div>
    </div>
</template>
