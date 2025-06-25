<template>
  <div
    ref="inputBox"
    tabindex="0"
    class="border w-full focus-color"
    @click="get_pointer_lock"
    @keydown="onKeyDown"
    @click.left="onLeftClick"
    @click.right="onRightClick"

    :onmousemove="onMouseMove"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { webrtc_store } from '@/stores/webrtc_store';
let lock_status = ref(false)

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const { session_data, members, 
  display_preference, rooms, members_updated, companyId, system_input_member_id } = storeToRefs(store)

import router from '@/router';
const webrtc_state = webrtc_store()
const { members_online,audio_room_events,video_room_events,
  media_route_audio, media_route_video } = storeToRefs(webrtc_state)

const props = defineProps(['member_id'])

const inputBox = ref();

function get_pointer_lock(){
  try{

    inputBox.value.requestPointerLock({
      // unadjustedMovement: true,
    });
  }
  catch {
    alert("Unable to get the pointer lock, this may be because you are using unsupported Browser or mobile browsers. Falling back to appox cursor momnents, this will not be accurate.")
    lock_status.value = true
  }
}

function send_system_contronls(type, payload) {
  if (!system_input_member_id.value) return

  console.log("sending pc input..")
   webrtc_state.get_woc().get_data_channel().send(JSON.stringify({
    Type: "route_to",
    route_to: system_input_member_id.value,
    data: JSON.stringify({
      type,
      payload
    }),
  }))
}

const keyMap = {
  ' ': 'Space',
  Alt: 'LeftAlt',
  Control: 'LeftControl',
  Shift: 'LeftShift',
  Meta: 'LeftSuper',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
};

const onKeyDown = (e) => {
  if(!lock_status.value) return
  const rawKey = e.key;
  const mappedKey = keyMap[rawKey] ?? rawKey;  // fall back to literal

  const isSpecial = mappedKey !== rawKey || mappedKey.length > 1;
  send_system_contronls('sendKeyboardInput', { key: mappedKey, isSpecial });
};
const onLeftClick = (e) => {
  if(!lock_status.value) return
  console.log("Left Mouse clicked");
  // window.electronAPI?.sendMouseInput('click');
  send_system_contronls("sendMouseLeftInputClick", {click:true})
};

const onRightClick = (e) => {
  if(!lock_status.value) return
  console.log("Right Mouse clicked");
  // window.electronAPI?.sendMouseInput('click');
  send_system_contronls("sendMouseRightInputClick", {click: true})
};


let lastSend = 0;
const TARGET_FPS = 60;  

// const onMouseMove = (e) => {
//   if(!lock_status.value) return

//   const now = Date.now();
//   if (now - lastSend >= 16) {
//     const scale = window.devicePixelRatio;
//     const x = Math.round(e.screenX * scale);
//     const y = Math.round(e.screenY * scale);
//     send_system_contronls("sendMouseInputMove", { x, y });
//     send_system_contronls("sendMouseInputMove", { x, y });
//     lastSend = now;
//   }

//   clearTimeout(debounceTimeout);
//   debounceTimeout = setTimeout(() => {
//     const scale = window.devicePixelRatio;
//     const x = Math.round(e.screenX * scale);
//     const y = Math.round(e.screenY * scale);
//     send_system_contronls("sendMouseInputMove", { x, y });
//   }, 100); // fallback trigger on last movement
// };
const MOUSE_SLOW_MOMENTS = TARGET_FPS * 0.1
function onMouseMove(e) {
  const now = performance.now();
  if (now - lastSend < 1000 / TARGET_FPS) return; // throttle to TARGET_FPS
  lastSend = now;
  send_system_contronls("sendMouseInputMove", {x: e.movementX * MOUSE_SLOW_MOMENTS, y: e.movementY * MOUSE_SLOW_MOMENTS});
}



function onLockChange() {
  console.log("Lock changed")
  const locked = document.pointerLockElement === inputBox.value;
  if (locked) {
      lock_status.value = true
    } else {
      lock_status.value = false
  }
}

onMounted(() => {
  console.log(system_input_member_id.value)
  inputBox.value?.focus(); // auto focus the div
  document.addEventListener('pointerlockchange', onLockChange);
});

</script>

<style scoped>
.focus-color {
  border-color: rgb(11, 180, 3);
  border-radius: 5px;
  border-width: 3px;
  height: 100%;
  width: 100%;
}
</style>