<template>
  <div
    ref="inputBox"
    tabindex="0"
    class="border w-full focus-color"
    @click="get_pointer_lock"
    @click.left="onLeftClick"
    @click.right="onRightClick"
    :onmousemove="onMouseMove"
  >
    <slot></slot>
    <input
      ref="hiddenInput"
      type="text"
      class="absolute opacity-0 pointer-events-none"
      @input="onTextInput"
      @keydown="onKeyDownSpecial"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { webrtc_store } from '@/stores/webrtc_store';
import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
import router from '@/router';

// === State Refs ===
let lock_status = ref(false);
const inputBox = ref();
const hiddenInput = ref();

const store = root_store();
const { session_data, members, display_preference, rooms, members_updated, companyId, system_input_member_id } = storeToRefs(store);
const webrtc_state = webrtc_store();
const { members_online, audio_room_events, video_room_events, media_route_audio, media_route_video } = storeToRefs(webrtc_state);

// === Queues ===
const keyboardQueue = [];
const mouseQueue = [];
let keyboardProcessing = false;
let mouseProcessing = false;

function send_system_contronls(type, payload) {
  if (!system_input_member_id.value) return;
  const event = { type, payload };

  if (type.startsWith('sendMouse')) {
    mouseQueue.push(event);
  } else if (type.startsWith('sendKeyboard')) {
    keyboardQueue.push(event);
  }
}

function send_system_controls_internal({ type, payload }) {
  return new Promise((resolve, reject) => {
    try {
      const message = {
        Type: "route_to",
        route_to: system_input_member_id.value,
        data: JSON.stringify({ type, payload }),
      };
      webrtc_state.get_woc().get_data_channel().send(JSON.stringify(message));
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

async function processKeyboardQueue() {
  if (keyboardProcessing) return;
  keyboardProcessing = true;

  while (true) {
    if (keyboardQueue.length > 0) {
      const event = keyboardQueue.shift();
      try {
        await send_system_controls_internal(event);
      } catch (e) {
        console.error('Keyboard send failed:', e);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }
}

async function processMouseQueue() {
  if (mouseProcessing) return;
  mouseProcessing = true;

  while (true) {
    if (mouseQueue.length > 0) {
      const event = mouseQueue.shift();
      try {
        await send_system_controls_internal(event);
      } catch (e) {
        console.error('Mouse send failed:', e);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }
}

// === Pointer Lock ===
function get_pointer_lock() {
  try {
    inputBox.value.requestPointerLock();
    hiddenInput.value?.focus();
  } catch {
    alert("Unable to get pointer lock. Unsupported browser or mobile.");
    lock_status.value = true;
  }
}

function onLockChange() {
  const locked = document.pointerLockElement === inputBox.value;
  lock_status.value = locked;

  if (locked) {
    hiddenInput.value?.focus();
  }
}

// === Mouse ===
const onLeftClick = (e) => {
  if (!lock_status.value) return;
  send_system_contronls("sendMouseLeftInputClick", { click: true });
};

const onRightClick = (e) => {
  if (!lock_status.value) return;
  send_system_contronls("sendMouseRightInputClick", { click: true });
};

let lastSend = 0;
const TARGET_FPS = 45;
const MOUSE_SLOW_MOMENTS = TARGET_FPS * 0.04;

function onMouseMove(e) {
  if (!lock_status.value) return;
  const now = performance.now();
  if (now - lastSend < 1000 / TARGET_FPS) return;
  lastSend = now;

  send_system_contronls("sendMouseInputMove", {
    x: e.movementX * MOUSE_SLOW_MOMENTS,
    y: e.movementY * MOUSE_SLOW_MOMENTS,
  });
}

// === Input Handlers ===
function onTextInput(e) {
  const value = e.target.value;
  if (!value || !lock_status.value) return;

  for (const ch of value) {
    send_system_contronls('sendKeyboardInput', {
      key: ch,
      isSpecial: false,
    });
  }

  e.target.value = '';
}

const specialKeys = new Set([
  'Backspace', 'Enter', 'Tab', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Delete', 'Home', 'End', 'PageUp', 'PageDown',
]);

function onKeyDownSpecial(e) {
  if (!lock_status.value) return;

  if (specialKeys.has(e.key)) {
    e.preventDefault(); // block default browser actions
    send_system_contronls('sendKeyboardInput', {
      key: e.key,
      isSpecial: true,
    });
  }
}

// === Mount ===
onMounted(() => {
  inputBox.value?.focus();
  document.addEventListener('pointerlockchange', onLockChange);
  processKeyboardQueue();
  processMouseQueue();
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

input[type="text"] {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
</style>
