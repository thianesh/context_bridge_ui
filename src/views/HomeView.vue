<script setup>
import DatePicker from 'primevue/datepicker';
import { ref, onMounted, watch, reactive } from "vue";

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {session_data, members} = storeToRefs(store)

async function get_members(){
    members.value = await store.get_members()
}

// Map of user_id -> video/audio DOM refs
const videoRefs = ref({})
const audioRefs = ref({})

onMounted(() => {
  get_members()
})

// webRTC codes
import { webrtc_store } from '@/stores/webrtc_store';
const webrtc_state = webrtc_store()
const { members_online } = storeToRefs(webrtc_state)

const offer_sdp = ref()
const main_conatainer = ref()

const trackToStreamMap = new Map();
const streamMap = new Map();


// ---------------------------------------- work space ----------------------------------------
const audio_route = ref({})
const video_route = ref({})

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


function assing_dom() {
  console.log("Assigned DOM")
  const woc = webrtc_state.get_woc()
  console.log(woc)

  webrtc_state.add_on_message()

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
      
      if(media_type=="video"){
        console.log("Received video stream from", my_user_id, member_user_id, media_type)
        console.log("Video refs", videoRefs.value)
        if(member_user_id in videoRefs.value) {
          console.log("Attaching video stream to element", member_user_id, videoRefs.value[member_user_id])

          // videoRefs.value[member_user_id].pause()
          // videoRefs.value[member_user_id].srcObject = null
          // videoRefs.value[member_user_id].currentTime = 0
          // videoRefs.value[member_user_id].load()

          attachStreamToElement(stream.id, videoRefs.value[member_user_id]);
        }
      }
      
      else if(media_type=="audio"){
        console.log("Received audio stream from", my_user_id, member_user_id, media_type)
        console.log("Audio refs", audioRefs.value)
        if(member_user_id in audioRefs.value) {
          console.log("Attaching audio stream to element", member_user_id, audioRefs.value[member_user_id])

          // audioRefs.value[member_user_id].pause()
          // audioRefs.value[member_user_id].srcObject = null
          // audioRefs.value[member_user_id].currentTime = 0
          // audioRefs.value[member_user_id].load()

          attachStreamToElement(stream.id, audioRefs.value[member_user_id]);
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
}


async function start_webrtc() {
  
  console.log("Starting webRTC")

  console.log(session_data)
  if(!session_data) {
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

  let response = await fetch("http://localhost:8080/start", requestOptions)
  let result = await response.json()
  console.log(result)
  console.log("accepting offer")

  await webrtc_state.accept_answer(result.SDP)

  
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


function log_tracks(){
  dumpTracks(webrtc_state.get_woc().pc)
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
</script>

<template>
  <div>
  <main ref="main_conatainer">
    <span>User logged In {{ session_data?.data?.session?.user.user_metadata.full_name }}</span>
    <br><br>
    <Button label="create_webrtc" icon="pi pi-video" @click="start_webrtc"></Button>
    <br><br>
    <Button label="log tracks" icon="pi pi-video" @click="log_tracks"></Button>
    <br><br>
    
    
  </main>

    <div class="video-grid">
        <div class="webrtc-container" v-for="member in members.filter(member => session_data?.data?.session?.user.id != member?.user_id)" :key="member.user_id">

          <Card :class="member.user_id in members_online ? 'online' : 'offline'">
            <template #title>
              <div style="display: flex;">
                <span style="font-size: 1rem;padding-right: 1rem;">{{ member.users.full_name }}</span>
                
                  <Tag severity="success" value="Online" rounded v-if="member.user_id in members_online"></Tag>
                  <!-- <Tag severity="warn" value="do not disturb" rounded></Tag> -->
                  <Tag severity="danger" value="offline" rounded v-else></Tag>

              </div>
            </template>

            <template #content>
              <video
                  playsinline
                  controls
                  :ref="el => videoRefs[member.user_id] = el"
                ></video>
                <Divider />
                <audio
                controls
                :ref="el => audioRefs[member.user_id] = el"
                ></audio>
                <br><br>
                <!-- <Divider /> -->
              </template>
              
              <template #footer>
                <div style="display: grid;gap: 5px;grid-template-columns:auto auto auto auto;">
                <Button icon="pi pi-microphone" severity="success" rounded aria-label="long press to speak" 
                @pointerdown.prevent="set_audio_route(member.user_id, true)" 
                @pointercancel="set_audio_route(member.user_id, false)"
                @pointerup.prevent="set_audio_route(member.user_id, false)"
                @contextmenu.prevent
                />
                <Button icon="pi pi-microphone" :severity="audio_route[member.user_id] ? 'success':'secondary' " 
                :label="audio_route[member.user_id] ? 'turn off' : 'turn on'" 
                @click="toggle_audio_route(member.user_id)"/>

                <Button icon="pi pi-video" :severity="video_route[member.user_id] ? 'success':'secondary' " 
                :label="video_route[member.user_id] ? 'turn off' : 'turn on'" 
                @click="toggle_video_route(member.user_id)"/>

              </div>
              <br>
              <!-- <Divider /> -->

              <div class="card">
                  <Accordion>
                      <AccordionPanel value="0">
                          <AccordionHeader>Send File</AccordionHeader>
                          <AccordionContent>
                             <div class="card" style="scale: 1;">
                                  <Toast />
                                  <FileUpload name="demo[]" url="/api/upload" @upload="onAdvancedUpload($event)" :multiple="true" accept="image/*" :maxFileSize="1000000">
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
                  </Accordion>
              </div>

            </template>
          </Card>

        </div>
      </div>
  </div>

</template>

<style scoped>

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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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
