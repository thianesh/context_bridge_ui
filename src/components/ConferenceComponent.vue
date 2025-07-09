
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
import {sortByActivity} from "@/util/sort_util"

import { webrtc_store } from '@/stores/webrtc_store';
import router from '@/router';
const webrtc_state = webrtc_store()
const { members_online, chat_messages, audio_room_events, video_room_events,
  media_route_audio, media_route_video, pc_control_list, members_online_list,
raise_hand, add_raise_hand, activity_map
} = storeToRefs(webrtc_state)

const room_id = ref("")
onMounted(() => {
  room_id.value = route.params.room_id;
});


// function attachStream(video_element, stream) {
//   try {
//     if(stream) {
//       video_element.srcObject = stream
//     }
//   }
//   catch(e) {
//     console.error("Unable to set the stream.")
//   }
// }

function registerVideo (el, member) {
  if (!el) return
  const streamHolder = videoRefs.value?.[member]
  if (streamHolder?.srcObject && el.srcObject !== streamHolder.srcObject) {
    el.srcObject = streamHolder.srcObject
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
// const access_list_ordered = ref([])

// function re_order(){
//   let list_to_ordered = rooms.value?.filter(room => room.id == room_id.value)[0]?.access_list
//   if(!list_to_ordered) list_to_ordered = [];
//   let sorted = sortByActivity(list_to_ordered, activity_map.value)
//   access_list_ordered.value.splice(0, access_list_ordered.value.length, ...sorted);
// }

// function reorderByActivity() {
//   const list_to_order = rooms.value?.find(room => room.id == room_id.value)?.access_list ?? [];

//   // Make sure `access_list_ordered.value` is only set once during setup
//   if (access_list_ordered.value.length === 0 && list_to_order.length > 0) {
//     access_list_ordered.value = [...list_to_order]; // initial assignment only
//   }

//   const ts = v => {
//     const d = v instanceof Date ? v
//       : typeof v === 'number' ? new Date(v)
//       : typeof v === 'string' ? new Date(v)
//       : null;
//     return d?.getTime?.() ?? -Infinity;
//   };

//   // Mutate in-place only
//   access_list_ordered.value.sort((a, b) => {
//     return ts(activity_map.value[b]) - ts(activity_map.value[a]);
//   });
// }

// setInterval(reorderByActivity, 1000)
const pinnedMember = ref("")

const access_list_ordered = computed(() => {
  let list_to_ordered = rooms.value?.filter(room => room.id == room_id.value)[0]?.access_list
  if(!list_to_ordered) list_to_ordered = [];
  let sorted = sortByActivity(list_to_ordered, activity_map.value)
  if(pinnedMember.value){
    sorted = sorted.filter(id => id != pinnedMember.value)
    sorted.unshift(pinnedMember.value)
  }
  return sorted
})

function is_video(member) {
  if(member in video_room_events.value) {
    return video_room_events.value[member][ Object.keys(video_room_events.value[member])[0] ].Video
  }
  return false
}

function shouldAnimate(updatedAt) {
  if(updatedAt){
    const diff = (Date.now() - updatedAt) / 1000; // convert ms to seconds
    return diff < 2.0;
  }
  return false
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
  <div 
     class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-auto"
  >
    <div
      v-for="(member, index) in access_list_ordered"
      :key="member"
      v-show="onlineRoomMembers.includes(member)"
     :class="pinnedMember === member ? 'col-span-3 row-span-3' : 'col-span-1'"
    >
    <!--  -->
      <div class="relative aspect-video bg-black bg-opacity-75 rounded-lg shadow-md"
      :class="{
        speaking: shouldAnimate(activity_map[member])
      }"
      >
        <video
          v-show="is_video(member)"
          :ref="el => registerVideo(el, member)"
          autoplay
          controls
          playsinline
          muted
          class="w-full h-full object-cover rounded-lg"
        ></video>

        <div v-show="!is_video(member)" class="w-full h-full flex items-center justify-center text-gray-400">
          <span v-if="member !== session_data?.data?.session?.user.id">
            <span class="w-20 h-20 rounded-full bg-gray-700 text-white font-bold text-lg flex items-center justify-center">
              {{ members.find(m => m.user_id === member)?.users?.full_name[0] }}
            </span>
          </span>
          <span v-else>
            <span class="w-20 h-20 rounded-full bg-gray-700 text-white font-bold text-lg flex items-center justify-center">
              You
            </span>
          </span>
        </div>

        <tag
          class="absolute top-1 left-1 bg-black bg-opacity-50 text-xs px-2 rounded"
          severity="warn"
          v-show="check_user_raised_hand(member)"
        >
          👋🏼 - {{ members.find(m => m.user_id === member)?.users?.full_name }}
        </tag>
        <tag
          class="absolute top-1 left-1 bg-black bg-opacity-50 text-xs px-2 rounded"
          severity="secondary"
          v-show="!check_user_raised_hand(member)"
        >
          {{ members.find(m => m.user_id === member)?.users?.full_name }}
        </tag>
        <tag class="absolute top-1 right-1 bg-black bg-opacity-50 text-xs px-2 rounded cursor-pointer" icon="pi pi-flag" v-if="member != pinnedMember" @click="pinnedMember = member">
          pin
        </tag>
        <tag class="absolute top-1 right-1 bg-black bg-opacity-50 text-xs px-2 rounded cursor-pointer" icon="pi pi-times" v-else @click="pinnedMember = ''">
          un-pin
        </tag>
      </div>
    </div>
  </div>
</template>


  
  </card>

        <div style="position: fixed;bottom:2rem;
        left:50%; transform: translate(-50%,0%);
        padding: 0.5rem;margin: auto;width: max-content; padding-left: 1rem;padding-right: 1rem;display: grid;width: max-content;gap: 0.5rem;grid-template-columns: auto auto auto auto auto;background-color: var(--p-form-field-background);border-radius: 30px;"
        >
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
        <Button rounded size="small" severity='success' @click="send_remove_raise_hand(session_data?.data?.session?.user.id)" v-show="check_user_raised_hand(session_data?.data?.session?.user.id)">
          <span class="material-symbols-rounded">
            <!-- do_not_touch -->
            back_hand
          </span>
        </Button>
        
        <Button rounded size="small" severity='secondary' @click="send_raise_hand(session_data?.data?.session?.user.id)" v-show="!check_user_raised_hand(session_data?.data?.session?.user.id)">
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
@keyframes fade_audio {
  0% {
    border-color: transparent;
    box-shadow: 0 0 0px hsla(146, 100%, 47%, 0);
  }
  30% {
    border-color: hsl(146 100% 47%);
    box-shadow: 0 0 12px 2px hsla(146, 100%, 47%, 0.35);
  }
  60% {
    border-color: hsl(146 100% 47%);
    box-shadow: 0 0 12px 2px hsla(146, 100%, 47%, 0.45);
  }
  100% {
    border-color: transparent;
    box-shadow: 0 0 0px hsla(146, 100%, 47%, 0);
  }
}

.speaking {
  border: 2px solid transparent; /* Keeps layout stable */
  animation: fade_audio 2s ease-in-out 0s 1 forwards;
  will-change: border-color, box-shadow;
}
</style>