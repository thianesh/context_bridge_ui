<script setup>
import { onMounted, ref, watch } from 'vue';
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const { display_preference } = storeToRefs(store)
import {replaceVideoTrackByDeviceId,replaceAudioTrackByDeviceId} from "../stores/replce_track"

import { webrtc_store } from '@/stores/webrtc_store';
const webrtc_state = webrtc_store()
const { members_online, audio_room_events, video_room_events,
    media_route_audio, media_route_video,allow_pc_control } = storeToRefs(webrtc_state)

function toggle_minimal() {
    display_preference.value.minimal = !display_preference.value.minimal
}

function share_screen() {
    webrtc_state?.get_woc()?.share_screen()
}

function stop_share() {
    webrtc_state?.get_woc()?.stop_share()
}

const cameras = ref([])
const microphones = ref([])
const selected_camera = ref({})
const selected_mic = ref({})

async function list_media() {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    microphones.value = devices.filter(device => device.kind === 'audioinput').map(device => {  return {deviceId: device.deviceId, label: device.label, groupId: device.groupId} })
    cameras.value = devices.filter(device => device.kind === 'videoinput').map(device => {  return {deviceId: device.deviceId, label: device.label, groupId: device.groupId} })
    console.log(microphones.value, cameras.value)
}

onMounted(async () => {
    await list_media()
})

watch(selected_camera, (new_val) => {
    console.log("User changed camera source:", new_val)
    const woc = webrtc_state?.get_woc()
    if(woc) {
        replaceVideoTrackByDeviceId(woc.pc, new_val.deviceId)
    }
})

watch(selected_mic, (new_val) => {
    console.log("User changed microphone source:", new_val)
    const woc = webrtc_state?.get_woc()
    if(woc) {
        replaceAudioTrackByDeviceId(woc.pc, new_val.deviceId)
    }
})

</script>

<template>
    <div>
        <p>Microphone</p>
        <br>
        <Select v-model="selected_mic" :options="microphones" optionLabel="label" placeholder="Change Mic"
            class="w-full md:w-56" />
        <br>
        <Divider />
        <h5>Camera</h5>
        <br>
        <Select v-model="selected_camera" :options="cameras" optionLabel="label" placeholder="Change Camera"
            class="w-full md:w-56" />

        <br><br>

        <Button label="Set to Minimal" @click="toggle_minimal" v-if="!display_preference.minimal"
            icon="pi pi-arrow-down-left-and-arrow-up-right-to-center"></Button>
        <Button label="Set to Maximal" @click="toggle_minimal" v-else
            icon="pi pi-arrow-up-right-and-arrow-down-left-from-center"></Button>

        <br><br>
        <Button label="Start Screen Share" @click="share_screen" icon="pi pi-upload"></Button>

        <br><br>
        <Button label="Stop Screen Share" @click="stop_share" icon="pi pi-times"></Button>

        <br><br>
        <ToggleButton v-model="allow_pc_control" onLabel="Control ON" offLabel="Control Off" />

    </div>
</template>

<style scoped>
.red {
    color: rgb(248, 41, 41);
}

.green {
    color: rgb(13, 233, 13);
}
</style>