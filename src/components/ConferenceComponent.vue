<!-- MeetReplica.vue -->
<template>
  <card class="flex flex-col">
    <!-- Top Bar -->
    <template #header>
      <div class="flex justify-between items-center p-4">
        <h1 class="text-lg font-semibold">{{rooms?.filter(room => room.id == room_id)[0]?.name}}</h1>
        <Button @click="router.push('/')" severity="danger">Back to home</Button>
      </div>
    </template>

    <!-- Video Grid -->
    <template #content>
      <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-auto">
        <!-- {{ rooms }} - {{ onlineRoomMembers }} -->
        <div v-for="(member, index) in rooms?.filter(room => room.id == room_id)[0]?.access_list" :key="member"
        v-show="onlineRoomMembers.filter(member_id => member == member_id).length > 0">
          <!-- {{ members.filter(member_ => member_.user_id == member)[0] }} -->
          <div class="relative aspect-video bg-black rounded-lg shadow-md">
            <video v-if="videoRefs[member]" :ref="el => attachStream(el, videoRefs[member].srcObject)" autoplay
              playsinline muted class="w-full h-full object-cover rounded-lg"></video>
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              No Video
            </div>
            <tag class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-xs px-2 rounded">
              {{members.filter(member_ => member_.user_id == member)[0]?.users?.full_name}}
            </tag>
          </div>
        </div>
      </div>
    </template>

    <!-- Control Bar -->
    <template #footer>
        <div style="padding: 0.5rem;margin: auto;width: max-content; padding-left: 1rem;padding-right: 1rem;display: grid;width: max-content;gap: 0.5rem;grid-template-columns: auto auto auto;background-color: var(--p-form-field-background);border-radius: 30px;">
        <Button rounded size="small" severity="secondary">
          <span class="material-symbols-outlined">
            mic_off
          </span>
        </Button>
        <Button rounded size="small" severity="secondary">
          <span class="material-symbols-outlined">
            videocam_off
          </span>
        </Button>
        <Button rounded size="small" severity="secondary">
          <span class="material-symbols-rounded">
            do_not_touch
          </span>
          <!-- back_hand -->
        </Button>

      </div>

    </template>
  </card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router';
const route = useRoute();

const micOn = ref(true)
const cameraOn = ref(true)

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const { session_data, members,
  display_preference, rooms, members_updated, companyId, system_input_member_id, videoRefs, audioRefs,
  audio_route,
  video_route,
  audio_route_rooms,
  video_route_rooms,
} = storeToRefs(store)

import { webrtc_store } from '@/stores/webrtc_store';
import router from '@/router';
const webrtc_state = webrtc_store()
const { members_online, audio_room_events, video_room_events,
  media_route_audio, media_route_video, pc_control_list } = storeToRefs(webrtc_state)

const room_id = ref("")
onMounted(() => {
  room_id.value = route.params.room_id;
});


function attachStream(video_element, stream) {
  video_element.srcObject = stream
}

const onlineRoomMembers = computed(() => {
  const room = rooms.value?.find(room => room.id === room_id.value);
  if (!room) return [];

  return room.access_list.filter(member_id => member_id in members_online.value);
});
</script>

<style scoped>
/* Optional styling enhancements */
@keyframes gradient-border-glow {
  0% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3), 0 0 18px rgba(0, 255, 0, 0.7);
    border-color: hsl(120, 100%, 60%);
  }

  50% {
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.2), 0 0 12px rgba(255, 165, 0, 0.6);
    border-color: hsl(30, 100%, 60%);
  }

  100% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3), 0 0 18px rgba(0, 255, 0, 0.7);
    border-color: hsl(120, 100%, 60%);
  }
}

.gradient-speaking-shadow {
  animation: gradient-border-glow 5s ease;
  border-width: 1px;
  border-style: solid;
}
</style>
