import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {webrtc_offer_creator } from "./offer_creator"

export const webrtc_store = defineStore('webrtc_store', () => {

    const woc = new webrtc_offer_creator();
    const members_online = ref([])

    async function create_root_offer(){
        const base64Sdp = await woc.makeOfferBase64();
        return base64Sdp
    }

    async function accept_answer(sdp) {
        await woc.acceptAnswerBase64(sdp)
    }
    
    async function close_root_offer() {
        await woc.close();
    }

    function get_woc(){
        return woc
    }

    function add_on_message(){
        woc.dc.onmessage = async (payload) => {
        
        console.log("from pinia [DC] onmessage");

        if (payload.data instanceof ArrayBuffer) {
            const msg = arrayBufferToObject(payload.data);
            console.log(msg);

            if (msg.event == "online_status") {
                members_online.value = msg.data.active_users;
            }
            
            if(woc.negotiating) return

            if (msg.Type === 'offer') {
            woc.negotiating = true
            woc.dc.send("Got the offer will be accepted soon!");
            console.log("Got the offer will be accepted soon!");

            const offer = new RTCSessionDescription({
                type: 'offer',
                sdp: msg.SDP,
            });

            await woc.pc.setRemoteDescription(offer);
            const answer = await woc.pc.createAnswer();
            await woc.pc.setLocalDescription(answer); // set first to trigger ICE gathering

            const sendAnswer = () => {
                console.log(">>>>>>>>>>>>>>>>>>>>>>> Sending Answer <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                woc.dc.send(
                JSON.stringify({ Type: 'answer', SDP: woc.pc.localDescription.sdp })
                );
            };

            if (woc.pc.iceGatheringState === 'complete') {
                sendAnswer();
            } else {
                await new Promise((resolve) => {
                const handler = () => {
                    if (woc.pc.iceGatheringState === 'complete') {
                    woc.pc.removeEventListener('icegatheringstatechange', handler);
                    resolve();
                    }
                };
                woc.pc.addEventListener('icegatheringstatechange', handler);
                });
                sendAnswer();
            }
            woc.negotiating = false
            }
        } else {
            // console.log('[DC] msg:', payload);
        }
    }
}

  return {
    get_woc,
    create_root_offer,
    close_root_offer,
    accept_answer,
    members_online,
    add_on_message
  }
})

// --------------------- Helper Functions ---------------------
function arrayBufferToObject(ab) {
  const jsonString = new TextDecoder('utf-8').decode(ab); // ↩︎ UTF-8 -> string
  return JSON.parse(jsonString);                          // ↩︎ string -> object
}