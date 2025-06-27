<template>
    <p>Microphone</p>
    <br>
    <div class="card">
        <ToggleButton v-model="microphone" class="w-24" onLabel="On" offLabel="Off" />
    </div>
    <br>
    <i class="pi pi-microphone" style="font-size: 2rem;" :class="{'red': !microphone, 'green': microphone}" ></i>
    <Divider />
    <h5>Camera</h5>
    <br>
    <div class="card">
        <ToggleButton v-model="camera" class="w-24" onLabel="On" offLabel="Off" />
    </div>
    <br>
    <i class="pi pi-video" style="font-size: 2rem;" :class="{'red': !camera, 'green': camera}" ></i>
    <br><br>

    <Button label="Set to Minimal" @click="toggle_minimal" v-if="!display_preference.minimal" icon="pi pi-arrow-down-left-and-arrow-up-right-to-center"></Button>
    <Button label="Set to Maximal" @click="toggle_minimal" v-else icon="pi pi-arrow-up-right-and-arrow-down-left-from-center"></Button>

    <br><br>
    <Button  label="Start Screen Share" @click="share_screen" icon="pi pi-upload"></Button>

    <br><br>
    <Button  label="Stop Screen Share" @click="stop_share" icon="pi pi-times"></Button>

    <br><br>
    <ToggleButton v-model="allow_pc_control" onLabel="Control ON" offLabel="Control Off" />


</template>

<script setup>
import { ref } from 'vue';
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {display_preference, allow_pc_control} = storeToRefs(store)

import { webrtc_store } from '@/stores/webrtc_store';
const webrtc_state = webrtc_store()
const { members_online,audio_room_events,video_room_events,
  media_route_audio, media_route_video } = storeToRefs(webrtc_state)

const microphone = ref(false);
const camera = ref(false);

function toggle_minimal(){
    display_preference.value.minimal = !display_preference.value.minimal
}

function share_screen(){
    webrtc_state?.get_woc()?.share_screen()
}

function stop_share(){
    webrtc_state?.get_woc()?.stop_share()
}
</script>

<style scoped>
.red {
    color: rgb(248, 41, 41);
}
.green {
    color: rgb(13, 233, 13);
}
</style>