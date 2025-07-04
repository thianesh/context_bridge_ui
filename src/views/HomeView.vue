<script setup>
import DatePicker from 'primevue/datepicker';
import { ref, onMounted, watch, reactive, computed } from "vue";
import TimedMessage from '../components/Timedmessages.vue'

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const video_preview = ref()
const preview_visible = ref(true)
const store = root_store()
const { session_data, members, 
  display_preference, rooms, members_updated, companyId, system_input_member_id } = storeToRefs(store)

async function get_members() {
  members.value = await store.get_members()
}
import { useToast } from "primevue/usetoast";
const toast = useToast();
// Map of user_id -> video/audio DOM refs
const videoRefs = ref({})
const audioRefs = ref({})

// webRTC codes
import { webrtc_store } from '@/stores/webrtc_store';
import router from '@/router';
const webrtc_state = webrtc_store()
const { members_online,audio_room_events,video_room_events,
  media_route_audio, media_route_video, pc_control_list } = storeToRefs(webrtc_state)

const visible = ref(false)
const video_element = ref()

import mouse_events from '@/components/mouse_events.vue';
import { useStorage } from '@vueuse/core';

onMounted(() => {

  })

watch(session_data, (new_session)=> {
  if(session_data.value?.data?.session) {
    console.log("CompanyId", companyId.value)

    setTimeout(()=> {
      if (session_data.value?.data?.session) {
          if(!companyId.value) {
        console.log("NO company")
        router.push('/company')
      }
      }
    }, 2000)

    if(!companyId.value) {
      console.log("NO company")
      router.push('/company')
    }


    else {
      get_members()
      check_system()
      // start_webrtc()
    }
  }
  else router.push('/auth')
})

function go_to_login(){
  router.push('/auth')
}

function select_space() {
  router.push('/company')
}
let timer;
const secondsRemaining = ref(60)

function startCountdown() {
          timer = setInterval(() => {
            if (secondsRemaining.value > 0) {
              secondsRemaining.value--;
            } else {
              clearInterval(timer);
            }
          }, 1000);
  }
const delay = ms => new Promise(res => setTimeout(res, ms));

const usage_history = useStorage("usage", {
  cpu: 0,
  ram: 0
})

async function check_system() {

  if(usage_history.value.cpu > 90) {
    await check_system_75()
    return
  }

  const myHeaders = new Headers();
  myHeaders.append("Authorization", "health-checkup");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  let response = await fetch("https://jo.vldo.in/health-check", requestOptions)
  let usage = await response.json()
  console.log(usage)
  usage_history.value = usage

  if(usage.cpu > 90) {
    store.add_loader_message("We are experiencing high demand. Please try again in few minutes. We will re-chech in 45s")
    await delay(45000)
    store.remove_loader_message("We are experiencing high demand. Please try again in few minutes. We will re-chech in 45s")
    await check_system_65()
  }
  else {
    start_webrtc()
  }

}

async function check_system_75() {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "health-checkup");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  let response = await fetch("https://jo.vldo.in/health-check", requestOptions)
  let usage = await response.json()
  console.log(usage)
  usage_history.value = usage

  if(usage.cpu > 75) {
    store.add_loader_message("We are experiencing high demand. Please try again in few minutes. We will re-chech in 45s")
    await delay(45000)
    store.remove_loader_message("We are experiencing high demand. Please try again in few minutes. We will re-chech in 45s")
    await check_system_75()
  }
  else {
    start_webrtc()
  }

}

const offer_sdp = ref()
const main_conatainer = ref()

const trackToStreamMap = new Map();
const streamMap = new Map();


// ---------------------------------------- work space ----------------------------------------
const audio_route = ref({})
const video_route = ref({})

const audio_route_rooms = ref({})
const video_route_rooms = ref({})

function toggle_audio_route(id) {
  audio_route.value = {           // ① NEW object reference
    ...audio_route.value,
    [id]: !audio_route.value[id],
  }
}

function toggle_video_route(id) {
  video_route.value = {           // ① NEW object reference
    ...video_route.value,
    [id]: !video_route.value[id],
  }
}

function set_audio_route(id, state) {
  audio_route.value = {           // ① NEW object reference
    ...audio_route.value,
    [id]: state,
  }
}

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

function set_audio_route_rooms(id, state) {
  audio_route_rooms.value = {           // ① NEW object reference
    ...audio_route_rooms.value,
    [id]: state,
  }
}

function turn_off_all_media() {
    [ audio_route.value,
    video_route.value,
    audio_route_rooms.value,
    video_route_rooms.value ].forEach(obj => {
      Object.keys(obj).forEach(key => obj[key] = false)
    })
}

watch(audio_route, newVal => {
  console.log('updated', newVal)
  // Signaling
  webrtc_state.get_woc().get_data_channel().send(JSON.stringify({
    Type: "audio_route",
    audio_route: newVal
  }))
})

watch(video_route, newVal => {
  console.log('updated', newVal)
  // Signaling
  webrtc_state.get_woc().get_data_channel().send(JSON.stringify({
    Type: "video_route",
    video_route: newVal
  }))
})

watch(audio_route_rooms, newVal => {
  console.log('updated audio room', newVal)
  // Signaling
  webrtc_state.get_woc().get_data_channel().send(JSON.stringify({
    Type: "audio_route_room",
    audio_route_room: newVal
  }))
})

watch(video_route_rooms, newVal => {
  console.log('updated video room', newVal)
  // Signaling
  webrtc_state.get_woc().get_data_channel().send(JSON.stringify({
    Type: "video_route_room",
    video_route_room: newVal
  }))
})

setInterval(()=>{

  if(members_online.value.length == 0) return
  
  webrtc_state.get_woc()?.get_data_channel()?.send(JSON.stringify({
    Type: "audio_route",
    audio_route: audio_route.value
  }))

  webrtc_state.get_woc()?.get_data_channel()?.send(JSON.stringify({
    Type: "video_route",
    video_route: video_route.value
  }))

  webrtc_state.get_woc()?.get_data_channel()?.send(JSON.stringify({
    Type: "audio_route_room",
    audio_route_room: audio_route_rooms.value
  }))

  webrtc_state.get_woc()?.get_data_channel()?.send(JSON.stringify({
    Type: "video_route_room",
    video_route_room: video_route_rooms.value
  }))

},5000)


function assing_dom() {
  console.log("Assigned DOM")
  const woc = webrtc_state.get_woc()
  console.log(woc)

  woc.video_preview = video_preview.value
  webrtc_state.add_on_message()

  woc.video_preview.srcObject = woc.camStream ? woc?.camStream : woc.videoStreamBlack
  woc.video_preview.play()

  woc.pc.ontrack = function (event) {
    const { track, streams } = event;
    if (track && streams.length) {
      trackToStreamMap.set(track.id, streams.map(s => s.id));
    }

    // saving streams
    const stream = event.streams[0];
    if (stream) {
      streamMap.set(stream.id, stream);

      let [my_user_id, member_user_id, media_type] = stream.id.split('_')

      if (media_type == "video") {
        console.log("Received video stream from", my_user_id, member_user_id, media_type)
        console.log("Video refs", videoRefs.value)
        if (member_user_id in videoRefs.value) {
          console.log("Attaching video stream to element", member_user_id, videoRefs.value[member_user_id])

          // videoRefs.value[member_user_id].pause()
          // videoRefs.value[member_user_id].srcObject = null
          // videoRefs.value[member_user_id].currentTime = 0
          // videoRefs.value[member_user_id].load()

          attachStreamToElement(stream.id, videoRefs.value[member_user_id]);
          // attachTrack(track, videoRefs.value[member_user_id]);
        }
      }

      else if (media_type == "audio") {
        console.log("Received audio stream from", my_user_id, member_user_id, media_type)
        console.log("Audio refs", audioRefs.value)
        if (member_user_id in audioRefs.value) {
          console.log("Attaching audio stream to element", member_user_id, audioRefs.value[member_user_id])

          // audioRefs.value[member_user_id].pause()
          // audioRefs.value[member_user_id].srcObject = null
          // audioRefs.value[member_user_id].currentTime = 0
          // audioRefs.value[member_user_id].load()

          const audioEl = attachStreamToElement(stream.id, audioRefs.value[member_user_id]);
          // logPlayerVolume(audioEl, 500)
          monitorAudioLevel(audioEl, { user_id: member_user_id, email: members.value.filter(member => member.user_id == member_user_id)[0]?.users.email} );

          // attachTrack(track, audioRefs.value[member_user_id]);
        }
      }
    }

    // var el = document.createElement(event.track.kind)
    // el.srcObject = event.streams[0]
    // el.autoplay = true
    // el.controls = true
    // main_conatainer.value.appendChild(el)
  }

}

function attachStreamToElement(streamId, mediaEl) {
  const stream = streamMap.get(streamId);
  if (!stream) {
    console.warn('No stream found for ID:', streamId);
    return;
  }

  mediaEl.srcObject = stream;
  mediaEl.autoplay = true;
  mediaEl.controls = true;
  mediaEl.playsInline = true;
  // mediaEl.load();
  mediaEl.play().catch(err => console.warn('Play error:', err));
  return mediaEl
}


function attach_video_to_dialog(member_user_id){
  setTimeout(()=>{
    system_input_member_id.value = member_user_id
    video_element.value.srcObject = videoRefs.value[member_user_id].srcObject
    console.log("assigning source")
  }, 1000)
}

watch(video_element, (new_val) => console.log("video element", new_val))

function attachTrack(track, el) {
  // Prevent duplicates
  if (el.srcObject && el.srcObject.getTracks().some(t => t.id === track.id))
    return;

  // If we already have something, stop & clear it first
  if (el.srcObject) {
    el.srcObject.getTracks().forEach(t => t.stop());
    el.srcObject = null;
  }

  // Build a fresh one-track stream – avoids “shared stream” confusion
  const fresh = new MediaStream([track]);
  el.srcObject  = fresh;
  el.autoplay   = true;
  el.playsInline = true;

  // React to remote pause/resume
  track.onmute  = () => el.classList.add('muted');
  track.onunmute = () => el.classList.remove('muted');

  el.play().catch(console.warn);
}

async function start_webrtc() {

  console.log("Starting webRTC")

  console.log(session_data)
  if (!session_data) {
    alert("Please login")
  }

  offer_sdp.value = await webrtc_state.create_root_offer()
  assing_dom()

  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${session_data.value.data.session.access_token}`);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "SDP": offer_sdp.value
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    let response = await fetch(`http://${window.location.hostname}:8080/start`, requestOptions)
    let result = await response.json()
    console.log(result)
    console.log("accepting offer")
    await webrtc_state.accept_answer(result.SDP)
  } catch (error) {
    console.log("error", error);
    alert("Unable to connect to our Server, Please try again after somtime. If you face the same issue consistently. please mail at thianesh08@gmail.com")
  }

}

function dumpTracks(pc) {
  console.log('–––– Local senders ––––');
  pc.getSenders().forEach((s, i) => {
    if (s.track) {
      const streamIds = trackToStreamMap.get(s.track.id)?.join(', ') ?? 'unknown';
      console.log(`#${i}`, s.track.kind, s.track.id, '| mid:', s.transport?.mid, '| streamId(s):', streamIds);
    }
  });

  console.log('–––– Remote receivers ––––');
  pc.getReceivers().forEach((r, i) => {
    if (r.track) {
      const streamIds = trackToStreamMap.get(r.track.id)?.join(', ') ?? 'unknown';
      console.log(`#${i}`, r.track.kind, r.track.id, '| mid:', r.transport?.mid, '| streamId(s):', streamIds);
    }
  });

  console.log('–––– Transceivers ––––');
  pc.getTransceivers().forEach((t, i) => {
    const senderId = t.sender.track?.id;
    const receiverId = t.receiver.track?.id;
    const senderStreams = senderId ? trackToStreamMap.get(senderId)?.join(', ') : 'none';
    const receiverStreams = receiverId ? trackToStreamMap.get(receiverId)?.join(', ') : 'none';

    console.log(
      `#${i}`,
      '| mid:', t.mid,
      '| dir:', t.direction,
      '| curDir:', t.currentDirection,
      '| sender:', t.sender.track?.kind ?? 'none',
      '| senderStream(s):', senderStreams ?? 'unknown',
      '| receiver:', t.receiver.track?.kind ?? 'none',
      '| receiverStream(s):', receiverStreams ?? 'unknown'
    );
  });

  console.log(
    'Total local =', pc.getSenders().filter(s => s.track).length,
    '| total remote =', pc.getReceivers().filter(r => r.track).length
  );
}


function log_tracks() {
  dumpTracks(webrtc_state.get_woc().pc)
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Swap elements
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

`

{
  "user_id": {
    video: "true/false",
    audio: "true/false",
  }
  "room_id": {
    video: "true/false",
    audio: "true/false",
  }
}

`

function sortUsers(users) {
  if(!users) return []
  return users.sort((a, b) => {

    const statusA = a.user_id in members_online.value ? 1 : 100
    const statusB = b.user_id in members_online.value ? 1 : 100

    if (statusA !== statusB) {
      return statusA - statusB
    }
    
    let a_room_score_video = 0
    if(a.user_id in video_room_events.value) {
      Object.keys(video_room_events.value[a.user_id]).forEach(key => {
        if(video_room_events.value[a.user_id][key].Video) a_room_score_video++
      })
    }
    
    let b_room_score_video = 0
    if(b.user_id in video_room_events.value) {
      Object.keys(video_room_events.value[b.user_id]).forEach(key => {
        if(video_room_events.value[b.user_id][key].Video) b_room_score_video++
      })
    }

    if(b_room_score_video != a_room_score_video) return b_room_score_video - a_room_score_video

    let a_room_score_audio = 0
    if(a.user_id in audio_room_events.value) {
      Object.keys(audio_room_events.value[a.user_id]).forEach(key => {
        if(audio_room_events.value[a.user_id][key].Audio) a_room_score_audio++
      })
    }

    let b_room_score_audio = 0
    if(b.user_id in audio_room_events.value) {
      Object.keys(audio_room_events.value[b.user_id]).forEach(key => {
        if(audio_room_events.value[b.user_id][key].Audio) b_room_score_audio++
      })
    }

    if(b_room_score_audio != a_room_score_audio) return b_room_score_audio - a_room_score_audio

    return 0

  })
}

const members_arranged = computed(()=>{
    return sortUsers(members.value)
})

function logPlayerVolume(audioEl, intervalMs = 500) {
  return setInterval(() => {
    console.log('🔈 volume setting:', audioEl.volume);
  }, intervalMs);
}

function monitorAudioLevel(audioEl, meta = {}) {
  // 1. Create & resume AudioContext (user gesture may be needed)
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') {
    const resume = () => { ctx.resume(); document.removeEventListener('click', resume); };
    document.addEventListener('click', resume, { once: true });
  }

  // 2. Capture the element’s output as a MediaStream
  const stream = audioEl.captureStream();               // avoids createMediaElementSource errors
  const src    = ctx.createMediaStreamSource(stream);

  // 3. Wire up an AnalyserNode
  const analyser    = ctx.createAnalyser();
  analyser.fftSize  = 256;                              // ~60fps granularity
  src.connect(analyser);

  const data = new Uint8Array(analyser.fftSize);
  let rafId;

  // 4. Poll loop: compute peak deviation from center (128)
  (function loop() {
    analyser.getByteTimeDomainData(data);
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const amp = Math.abs(data[i] - 128);
      if (amp > peak) peak = amp;
    }
    if (peak > 20) {
      console.log('🔊 peak amplitude:', peak, meta, audioEl);
    }
    rafId = requestAnimationFrame(loop);
  })();

  // 5. Return cleanup handle
  return () => {
    cancelAnimationFrame(rafId);
    ctx.close();
  };
}
</script>

<template>
  <div>
    <p severity="secondary" rounded style="margin: auto;" v-if="session_data?.data?.session">Hi {{ session_data?.data?.session?.user.user_metadata.full_name }}! ( {{ session_data?.data?.session?.user.user_metadata.email }} )</p>

    <div class="card flex flex-wrap gap-2 mb-2 mt-4">
      <!-- <Message size="small" severity="secondary" style="width: max-content;">
      sending audio <tag :severity="Object.keys(audio_route).filter(key => audio_route[key]).length ? 'warn' : 'success'">{{ Object.keys(audio_route).filter(key => audio_route[key]).length }}</tag>
      </Message>
     
      receiving video: {{ Object.keys(video_route).length }} |
      rooms receiving video: {{ Object.keys(audio_route_rooms).length }} |
      rooms receiving video: {{ Object.keys(video_route_rooms).length }}  -->

      <Chip class="py-0 pl-0 pr-4" style="background-color: transparent;">
          <span class="bg-primary text-primary-contrast rounded-full w-8 h-8 flex items-center justify-center">
            {{ Object.keys(audio_route).filter(key => audio_route[key]).length }}
          </span>
          <span class="ml-2 font-medium">sending audio</span>
      </Chip>

       <Chip class="py-0 pl-0 pr-4" style="background-color: transparent;">
          <span class="bg-primary text-primary-contrast rounded-full w-8 h-8 flex items-center justify-center">
            {{ Object.keys(video_route).filter(key => video_route[key]).length }}
          </span>
          <span class="ml-2 font-medium">sending video</span>
      </Chip>

       <Chip class="py-0 pl-0 pr-4" style="background-color: transparent;">
          <span class="bg-primary text-primary-contrast rounded-full w-8 h-8 flex items-center justify-center">
            {{ Object.keys(audio_route_rooms).filter(key => audio_route_rooms[key]).length }}
          </span>
          <span class="ml-2 font-medium">sending video</span>
      </Chip>

       <Chip class="py-0 pl-0 pr-4" style="background-color: transparent;">
          <span class="bg-primary text-primary-contrast rounded-full w-8 h-8 flex items-center justify-center">
            {{ Object.keys(video_route_rooms).filter(key => video_route_rooms[key]).length }}
          </span>
          <span class="ml-2 font-medium">sending video</span>
      </Chip>

      <Chip class="py-0 pl-0 pr-4" style="background-color: transparent;">
        <Button label="stop all" severity="secondary" @click="turn_off_all_media()" outlined></Button>
      </Chip>
      
    </div>
    <Toast />
      <Button severity="warn" rounded label="You are not Signed In, click here to sign-in" @click="go_to_login" v-if="!session_data?.data?.session"></Button>
      <br><br>

      <Message severity="error" v-if="!companyId" @click="router.push('/company')">Please select the space you want to continue with.</Message>
      <!-- <br><br>
      <Button label="create_webrtc" icon="pi pi-video" @click="start_webrtc"></Button>
      <br><br>
      <Button label="log tracks" icon="pi pi-video" @click="log_tracks"></Button>
      <br><br> -->

    <div class="card flex justify-center">
        <Dialog v-model:visible="visible" maximizable modal header="System Access" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
          <mouse_events>
            <video class="system-control" ref="video_element"  autoplay muted playsinline controls style="pointer-events: none;"></video>
          </mouse_events>
        </Dialog>
    </div>

    <div class="p-card" style="padding: 1rem;" v-if="! (session_data?.data?.session?.user.id in members_online)">
      <!-- <Message severity="secondary">Connecting to Server... </Message> -->
       <TimedMessage :messages="[
  { message: 'Connecting to server...', timeout: 0, severity: 'secondary' },
  { message: 'Please hold on', timeout: 5, severity: 'secondary' },
  { message: 'This is taking longer than usual', timeout: 15, severity: 'warn' },
  { message: 'Please bear with us', timeout: 40, severity: 'error' },
  { message: 'Something is wrong. Please try again after somtime.', timeout: 40, severity: 'error' },
]" v-if="session_data?.data?.session" ></TimedMessage>
        <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>


    <div class="video-grid-small" v-else>
      <div class="webrtc-container"
        v-for="room in rooms"
        :key="room.id">

        <Card>
          <template #title>
            <div style="display: flex;width: 100%;text-align: center;">
              <span style="font-size: 1.5rem;margin: auto;">
                {{ room.name }}
                <tag severity="info">{{ room.access_list.filter(member_id => member_id in members_online)?.length }} online</tag>
              </span>
            </div>
          </template>

          <template #footer>
            <div style="display: grid;gap: 5px;grid-template-columns:auto auto auto auto;">
              <Button icon="pi pi-microphone" severity="success" rounded aria-label="long press to speak"
                @pointerdown.prevent="set_audio_route_rooms(room.id, true)"
                @pointercancel="set_audio_route_rooms(room.id, false)"
                @pointerup.prevent="set_audio_route_rooms(room.id, false)" @contextmenu.prevent />
              <Button icon="pi pi-microphone" :severity="audio_route_rooms[room.id] ? 'success' : 'secondary'"
                :label="audio_route_rooms[room.id] ? 'turn off' : 'turn on'"
                @click="toggle_audio_route_rooms(room.id)" size="small" />

              <Button icon="pi pi-video" :severity="video_route_rooms[room.id] ? 'success' : 'secondary'"
                :label="video_route_rooms[room.id] ? 'turn off' : 'turn on'"
                @click="toggle_video_route_rooms(room.id)" size="small" />

            </div>
            
            <!-- <Divider /> -->

            <div class="card">
              <Accordion>
                <AccordionPanel value="0">
                  <AccordionHeader>members</AccordionHeader>
                  <AccordionContent>
                    <div v-for="member_id in room.access_list">
                      <Message severity="secondary">
                      {{  members_updated.filter(member => member.user_id == member_id)[0]?.email_name }}

                      <Tag severity="success" v-if="member_id in members_online">online</Tag>
                      <Tag severity="danger" v-else>offline</Tag>
                      
                    </Message>
                    </div>
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
            </div>

          </template>
        </Card>

        

      </div>
    </div>
    <Divider></Divider>
    <div :class="{ 'video-grid': !display_preference.minimal, 'video-grid-small': display_preference.minimal }">
      <div class="webrtc-container"
        v-for="member in members_arranged.filter(member => session_data?.data?.session?.user.id != member?.user_id)"
        :key="member.user_id">
        
        <Card :class="member.user_id in members_online ? 'online' : 'offline'">
          <template #title v-if="!display_preference.minimal">
            <div style="display: flex;">
              <span style="font-size: 1rem;padding-right: 1rem;">{{ member.users.full_name }}</span>

              <Tag severity="success" value="Online" rounded v-if="member.user_id in members_online"></Tag>
              <!-- <Tag severity="warn" value="do not disturb" rounded></Tag> -->
              <Tag severity="danger" value="offline" rounded v-else></Tag>
              
              <span v-if="(member.user_id in audio_room_events)">
                <span v-for="(status, room_id) in audio_room_events[member.user_id]">
                  <span v-if="rooms.filter(room => room.id == room_id).length">
                    <Message v-if="status.Audio" severity="secondary">Audio
                      <Tag severity="warn">{{ rooms.filter(room => room.id == room_id)[0]?.name }}</Tag>
                    </Message>

                  </span>
                </span>
              </span>

              <span v-if="(member.user_id in video_room_events)">
                <span v-for="(status, room_id) in video_room_events[member.user_id]">
                  <span v-if="rooms.filter(room => room.id == room_id).length">
                    <Message v-if="status.Video" severity="secondary">Video
                      <Tag severity="warn">{{ rooms.filter(room => room.id == room_id)[0]?.name }}</Tag>
                    </Message>

                  </span>
                </span>
              </span>

            </div>
          </template>

          <template #content>
            <video playsinline controls :ref="el => videoRefs[member.user_id] = el"></video>
            <Divider />
            <div style="display: flex;">

               <audio controls :ref="el => audioRefs[member.user_id] = el"></audio>
              
              <!-- <audio controls :ref="el => audioRefs[member.user_id] = el" 
                :style="{ 
                  position: !media_route_audio[member.user_id] ?  'absolute' : 'relative',
          visibility: media_route_audio[member.user_id] ? 'visible' : 'hidden',}"
          ></audio>
              <audio controls 
              :style="{
                position: media_route_audio[member.user_id] ?  'absolute' : 'relative',
          visibility: !media_route_audio[member.user_id] ? 'visible' : 'hidden',}"></audio> -->
              
              <span>
                <tag icon="pi pi-video" severity="success" style="margin:5px;" v-if="media_route_video[member.user_id]"></tag>
                <tag severity="success" icon="pi pi-volume-up" style="margin:5px;" v-if="media_route_audio[member.user_id]"></tag>
              </span>
            </div>
            <br>
            <!-- <Divider /> -->
          </template>

          <template #footer>
            <div style="display: grid;gap: 5px;grid-template-columns:auto auto auto auto;">
              <Button icon="pi pi-microphone" severity="success" rounded aria-label="long press to speak"
                @pointerdown.prevent="set_audio_route(member.user_id, true)"
                @pointercancel="set_audio_route(member.user_id, false)"
                @pointerup.prevent="set_audio_route(member.user_id, false)" @contextmenu.prevent />
              <Button icon="pi pi-microphone" :severity="audio_route[member.user_id] ? 'success' : 'secondary'"
                :label="audio_route[member.user_id] ? 'turn off' : 'turn on'"
                @click="toggle_audio_route(member.user_id)" :size="display_preference.minimal ? 'small' : 'normal'" />

              <Button icon="pi pi-video" :severity="video_route[member.user_id] ? 'success' : 'secondary'"
                :label="!display_preference.minimal ? (video_route[member.user_id] ? 'turn off' : 'turn on') : ''"
                @click="toggle_video_route(member.user_id)" :size="display_preference.minimal ? 'small' : 'normal'" />

              <Button :size="display_preference.minimal ? 'small' : 'normal'" 
              icon="pi pi-desktop" severity="warn" @click="( (visible = true) && attach_video_to_dialog(member.user_id) )" />

            </div>
            <p style="font-size: 1rem;padding:0px;margin: 0px; margin-top: 2rem;" v-if="display_preference.minimal">{{
              member.users.full_name }} <tag severity="warn" icon="pi pi-exclamation-triangle" v-if="pc_control_list[member.user_id]">pc_control</tag>
              <Tag severity="success" value="Online" rounded v-if="member.user_id in members_online"></Tag>
              <Tag severity="danger" value="offline" rounded v-else></Tag>
              <span v-if="(member.user_id in audio_room_events)">
                <span v-for="(status, room_id) in audio_room_events[member.user_id]">
                  <span v-if="rooms.filter(room => room.id == room_id).length">
                    <Message v-if="status.Audio" severity="secondary">Audio
                      <Tag severity="warn">{{ rooms.filter(room => room.id == room_id)[0]?.name }}</Tag>
                    </Message>

                  </span>
                </span>
              </span>

              <span v-if="(member.user_id in video_room_events)">
                <span v-for="(status, room_id) in video_room_events[member.user_id]">
                  <span v-if="rooms.filter(room => room.id == room_id).length">
                    <Message v-if="status.Video" severity="secondary">Video
                      <Tag severity="warn">{{ rooms.filter(room => room.id == room_id)[0]?.name }}</Tag>
                    </Message>

                  </span>
                </span>
              </span>

            </p>

            <!-- <br> -->
            <!-- <Divider /> -->

            <div class="card" v-if="!display_preference.minimal">
              <Accordion>
                <AccordionPanel value="0">
                  <AccordionHeader>Send File</AccordionHeader>
                  <AccordionContent style="overflow: auto;width: 300px;">
                    <div class="" style="width: max-content;scale: 0.8;">
                      <FileUpload name="demo[]" url="/api/upload" @upload="onAdvancedUpload($event)" :multiple="true"
                        accept="image/*" :maxFileSize="1000000">
                        <template #empty>
                          <span>Drag and drop files to here to upload.</span>
                        </template>
                      </FileUpload>
                    </div>
                  </AccordionContent>
                </AccordionPanel>

                <AccordionPanel value="1">
                  <AccordionHeader>User details</AccordionHeader>
                  <AccordionContent>
                    {{ member.users.full_name }}<br>
                    {{ member.users.email }}<br>
                    {{ member.user_id }}<br>
                  </AccordionContent>
                </AccordionPanel>

                 <AccordionPanel value="1">
                  <AccordionHeader>Computer Control <tag severity="warn" icon="pi pi-exclamation-triangle" v-if="pc_control_list[member.user_id]">pc_control</tag> </AccordionHeader>
                  <AccordionContent>
                      <ToggleButton v-model="pc_control_list[member.user_id]" onLabel="Control ON" offLabel="Control Off" />
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
            </div>

          </template>
        </Card>
      </div>
    </div>

    <Dialog :visible="true" header="Video preview" position="bottomleft" :closable="false" class="video-preview" >
      <video controls ref="video_preview" style="max-width: 25rem;" :style="{height:preview_visible ? '200px' : '0px'}"></video>
       <template #footer>
        <Button :label="preview_visible ? 'Hide Preview' : 'Show Preview' " text severity="secondary" @click="preview_visible = !preview_visible" />
    </template>
    </Dialog>
  </div>

</template>

<style scoped>
.video-preview {
  padding: 0rem;
}
.system-control {
  width: 100%;
  height: 100%;
}

/* Chrome, Edge, Safari (WebKit/Blink) */
audio::-webkit-media-controls-time-remaining-display {
  display: none !important;
}

/* Firefox (Gecko) */
audio::-moz-media-controls-time-remaining-display {
  display: none !important;
}

.online {
  opacity: 1;
}


.offline {
  /* opacity: 0.6; */
  pointer-events: none;
  touch-action: none;
  filter: blur(2px) grayscale(1);
  transition: all 0.3s ease-in-out;
}

.more-info {
  text-align: left;
  display: grid;
  grid-template-columns: 75px 150px;
  overflow: hidden;
  max-width: 100%;
  gap: 1rem;
}

.video-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  margin: 0 auto;
  max-width: 1200px;
}

.video-grid-small {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  margin: 0 auto;
  max-width: 1200px;
}

.webrtc-container {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.webrtc-container video {
  width: 100%;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}

.webrtc-container audio {
  width: 100%;
  max-width: 100%;
  max-height: 100%;
}

.webrtc-container video {
  aspect-ratio: 16/9;
}
</style>
