
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
const { members_online, chat_messages, audio_room_events, video_room_events,
  media_route_audio, media_route_video, pc_control_list,
raise_hand, add_raise_hand
} = storeToRefs(webrtc_state)

const room_id = ref("")
onMounted(() => {
  room_id.value = route.params.room_id;
});


function attachStream(video_element, stream) {
  try {
    if(stream) {
      video_element.srcObject = stream
    }
  }
  catch(e) {
    console.error("Unable to set the stream.")
  }
}

const onlineRoomMembers = computed(() => {
  const room = rooms.value?.find(room => room.id === room_id.value);
  if (!room) return [];

  return room.access_list.filter(member_id => member_id in members_online.value);
});

function toggle_audio_route_rooms(id) {
  audio_route_rooms.value = {           // ① NEW object reference
    ...audio_route_rooms.value,
    [id]: !audio_route_rooms.value[id],
  }
}

function toggle_video_route_rooms(id) {
  video_route_rooms.value = {           // ① NEW object reference
    ...video_route_rooms.value,
    [id]: !video_route_rooms.value[id],
  }
}
const chat_visible = ref(false)

function check_user_raised_hand(member_id) {
  return raise_hand.value.includes(member_id)
}

// const video_preview = ref()

// function set_preview() {
//   const woc = webrtc_state.get_woc()
//   video_preview.value.srcObject = woc.camStream ? woc?.camStream : woc.videoStreamBlack
//   video_preview.value.video_preview.play()
// }

function send_raise_hand(member_id) {
  console.log("sending raise hand")
  webrtc_state.add_raise_hand(member_id)

  rooms.value?.filter(room => room.id == room_id.value)[0]?.access_list.forEach(member => {
    if(member in members_online.value){
      let message = {
        Type: "route_to",
        route_to: member,
        data: JSON.stringify({ type: "raiseHand",payload: { member_id } }),
      }
      webrtc_state.get_woc().get_data_channel().send(JSON.stringify(message));
    }
  })

}

function send_remove_raise_hand(member_id) {
  webrtc_state.remove_raise_hand(member_id)
  
   rooms.value?.filter(room => room.id == room_id.value)[0]?.access_list.forEach(member => {
    if(member in members_online.value){
      let message = {
        Type: "route_to",
        route_to: member,
        data: JSON.stringify({ type: "raiseHandRemove",payload: { member_id } }),
      }
      webrtc_state.get_woc().get_data_channel().send(JSON.stringify(message));
    }
  })

}

const input_message = ref("")
const diable_input = ref(false)

function send_message(draft) {
  diable_input.value = true
  if(!Object.keys(members_online.value).length) {
    alert("You are not online yet. Please wait for few seconds.")
    diable_input.value = false
    return
  }
  rooms.value?.filter(room => room.id == room_id.value)[0]?.access_list.forEach(member => {
    if(member in members_online.value){
      let message = {
        Type: "route_to",
        route_to: member,
        data: JSON.stringify({ type: "chat", payload: {
          name: session_data.value?.data?.session?.user.user_metadata.full_name,
          message: draft,
          time: Date.now(),
          member_id: session_data.value?.data?.session?.user.id},
        }),
      }
      webrtc_state.get_woc().get_data_channel().send(JSON.stringify(message));
      input_message.value = ""
      diable_input.value = false
    }
  })
}

</script>


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
              controls
              playsinline muted class="w-full h-full object-cover rounded-lg"></video>
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span v-if="member != session_data?.data?.session?.user.id">No Video</span>
              <span v-else>You</span>
              <!-- {{ member }} - {{ raise_hand }} -->
            </div>
            <tag class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-xs px-2 rounded" severity="warn" v-if="check_user_raised_hand(member)">
              👋🏼 - {{members.filter(member_ => member_.user_id == member)[0]?.users?.full_name}}
            </tag>
            <tag class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-xs px-2 rounded" severity="secondary" v-else>
              {{members.filter(member_ => member_.user_id == member)[0]?.users?.full_name}}
            </tag>
          </div>
        </div>
      </div>
    </template>

    <!-- Control Bar -->
    <template #footer>
        <div style="padding: 0.5rem;margin: auto;width: max-content; padding-left: 1rem;padding-right: 1rem;display: grid;width: max-content;gap: 0.5rem;grid-template-columns: auto auto auto auto auto;background-color: var(--p-form-field-background);border-radius: 30px;">
        <Button rounded size="small" :severity="audio_route_rooms[room_id] ? 'success' : 'secondary'" @click="toggle_audio_route_rooms(room_id)">
          <span class="material-symbols-outlined" v-if="audio_route_rooms[room_id]">
            mic
          </span>
          <span class="material-symbols-outlined" v-else>
            mic_off
          </span>
        </Button>
        <Button rounded size="small" :severity="video_route_rooms[room_id] ? 'success' : 'secondary'" @click="toggle_video_route_rooms(room_id)">
          <span class="material-symbols-outlined" v-if="video_route_rooms[room_id]">
            videocam
          </span>
          <span class="material-symbols-outlined" v-else>
            videocam_off
          </span>
        </Button>
        <Button rounded size="small" severity='success' @click="send_remove_raise_hand(session_data?.data?.session?.user.id)" v-if="check_user_raised_hand(session_data?.data?.session?.user.id)">
          <span class="material-symbols-rounded">
            <!-- do_not_touch -->
            back_hand
          </span>
        </Button>
        
        <Button rounded size="small" severity='secondary' @click="send_raise_hand(session_data?.data?.session?.user.id)" v-else>
          <span class="material-symbols-rounded">
            <!-- do_not_touch -->
            back_hand
          </span>
        </Button>
        <Button rounded size="small" severity="secondary">
          <span class="material-symbols-outlined">
          thumb_up
          </span>
          <!-- back_hand -->
        </Button>
         <Button rounded size="small" severity="secondary" @click="chat_visible = !chat_visible">
         <span class="material-symbols-outlined">
mode_comment
</span>
          <!-- back_hand -->
        </Button>

      </div>

    </template>
  </card>

  <Dialog v-model:visible="chat_visible" header="Edit Profile" :style="{ width: '25rem' }" position="bottomright" :modal="false" :draggable="true">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Chat</span>
    <div style="overflow: auto;max-height: 300px;">
    <div class="flex items-center gap-4 mb-4" v-for="(message, index) in chat_messages" v-bind:key="index">
      <tag severity="warn">{{ message.name }}</tag> 
          <Message severity="secondary"> {{ message.message }} <tag severity="info">{{ message.time.toLocaleString({
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) }}</tag></Message>
      </div>
    </div>
       <div class="flex items-center gap-4 mb-8">
            <label for="email" class="font-semibold w-24">message</label>
            <InputText id="email" class="flex-auto" v-model="input_message" autocomplete="off" :disabled="diable_input" @keyup.enter="send_message(input_message)" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="send" :disabled="diable_input" icon="pi pi-send" severity="secondary" @click="send_message(input_message)"></Button>
            <Button type="button" label="close" severity="secondary" @click="chat_visible = false"></Button>
        </div>
  </Dialog>

</template>

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
