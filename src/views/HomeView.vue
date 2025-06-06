<script setup>
import DatePicker from 'primevue/datepicker';
import { ref, onMounted } from "vue";

import { root_store } from '@/stores/root_store'
import { storeToRefs } from 'pinia'
const store = root_store()
const {session_data} = storeToRefs(store)

import { useRouter } from 'vue-router';

// webRTC codes
import { webrtc_store } from '@/stores/webrtc_store';
const webrtc_state = webrtc_store()

const offer_sdp = ref()

const remoteAudioOne = ref()
const remoteAudioTwo = ref()
const remoteVideoOne = ref()
const remoteVideoTwo = ref()
const remoteVideoElse = ref()
const remoteAudioElse = ref()
const main_conatainer = ref()

function assing_dom() {
  console.log("Assigned DOM")
  const woc = webrtc_state.get_woc()
  console.log(woc)
  woc.pc.ontrack = function (event) {
  var el = document.createElement(event.track.kind)
  el.srcObject = event.streams[0]
  el.autoplay = true
  el.controls = true
  main_conatainer.value.appendChild(el)
}

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
      console.log(`#${i}`, s.track.kind, s.track.id, 'mid', s.transport?.mid);
    }
  });

  console.log('–––– Remote receivers ––––');
  pc.getReceivers().forEach((r, i) => {
    if (r.track) {
      console.log(`#${i}`, r.track.kind, r.track.id, 'mid', r.transport?.mid);
    }
  });

  console.log('–––– Transceivers ––––');
  pc.getTransceivers().forEach((t, i) => {
    console.log(
      `#${i}`,
      'mid', t.mid,
      'dir', t.direction,
      'curDir', t.currentDirection,
      'sender', t.sender.track?.kind ?? 'none',
      'receiver', t.receiver.track?.kind ?? 'none',
    );
  });

  console.log('Total local =', pc.getSenders().filter(s => s.track).length,
              '| total remote =', pc.getReceivers().filter(r => r.track).length);
}

function log_tracks(){
  dumpTracks(webrtc_state.get_woc().pc)
}

</script>

<template>
  <main ref="main_conatainer">
    <span>User logged In {{ session_data?.data?.session?.user.user_metadata.full_name }}</span>
    <br><br>
    <Button label="create_webrtc" icon="pi pi-video" @click="start_webrtc"></Button>
    <br><br>
    <Button label="log tracks" icon="pi pi-video" @click="log_tracks"></Button>
    <br><br>
    <Button label="assign DOM" icon="pi pi-video" @click="assing_dom"></Button>
    <br><br>
   
  </main>
</template>
