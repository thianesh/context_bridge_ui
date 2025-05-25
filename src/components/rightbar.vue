<template>
    <p>Microphone</p>
    <div class="card flex justify-center">
        <ToggleButton v-model="microphone" class="w-24" onLabel="On" offLabel="Off" />
    </div>
    <br>
    <i class="pi pi-microphone" style="font-size: 2rem;" :class="{'red': !microphone, 'green': microphone}" ></i>
    <Divider />
    <h5>Camera</h5>
    <div class="card flex justify-center">
        <ToggleButton v-model="camera" class="w-24" onLabel="On" offLabel="Off" />
    </div>
    <br>
    <i class="pi pi-video" style="font-size: 2rem;" :class="{'red': !camera, 'green': camera}" ></i>

</template>

<script setup>
import { ref } from 'vue';

const microphone = ref(false);
const camera = ref(false);
</script>

<style scoped>
.red {
    color: rgb(248, 41, 41);
}
.green {
    color: rgb(13, 233, 13);
}
</style>