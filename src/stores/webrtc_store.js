import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {webrtc_offer_creator } from "./offer_creator"
import { useStorage } from '@vueuse/core'

export const webrtc_store = defineStore('webrtc_store', () => {

    const woc = new webrtc_offer_creator();
    const members_online = ref([])
    const video_room_events = ref({})
    const audio_room_events = ref({})
    const media_route_video = ref({})
    const media_route_audio = ref({})
    const pc_control_list = useStorage('pc_control_list',{})

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
        
        // console.log("from pinia [DC] onmessage");

        if (payload.data instanceof ArrayBuffer) {
            const msg = arrayBufferToObject(payload.data);
            // console.log(msg);

            if (msg.event == "online_status") {
                members_online.value = msg.data.active_users;
            }

            else if (msg.event == "video_room_event") {
                video_room_events.value = {
                    ...video_room_events.value,
                    ...msg
                }
            }

            else if (msg.event == "audio_room_event") {
                audio_room_events.value = {
                    ...audio_room_events.value,
                    ...msg
                }
            }

            else if (msg.event == "media_route_video") {
                media_route_video.value = {
                    ...media_route_video.value,
                    ...msg.data
                }
            }

            else if (msg.event == "media_route_audio") {
                media_route_audio.value = {
                    ...media_route_audio.value,
                    ...msg.data
                }
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

            if (msg.Type === 'route_to'){
                if(pc_control_list.value[msg.route_from]){
                    `
                    {Type: 'route_to', data: '{"type":"sendMouseInputMove","payload":{"x":683,"y":760}}', 
                    route_from: '43c54dd1-1609-4575-8151-721d700b2a3e', route_to: '278d6145-4db7-4498-b305-8a18c0bf64ed'}

                    "{"type":"sendMouseInputMove","payload":{"x":882,"y":897}}"
                    
                    '{"type":"sendKeyboardInput","payload":"d"}'

                    "{"type":"sendMouseLeftInputClick","payload":{"click":true}}"

                    "{"type":"sendMouseRightInputClick","payload":{"click":true}}"
                    
                    // window.electronAPI?.sendKeyboardInput(key);
                    // window.electronAPI?.sendMouseInput('click');
                    // window.electronAPI?.sendMouseInput('click');
                    // window.electronAPI?.sendMouseInput('move', { x, y });

                    `
                    const data = JSON.parse(msg.data)
                    if (data) {
                        // console.log("sending to electron",data)
                        switch (data.type) {
                        case "sendMouseInputMove":
                            window.electronAPI?.sendMouseInput('move', data.payload);
                            break;
                        case "sendKeyboardInput":
                            window.electronAPI?.sendKeyboardInput(data.payload);
                            break;
                        case "sendMouseLeftInputClick":
                            window.electronAPI?.sendMouseInput('left_click','click');
                            break;
                        case "sendMouseRightInputClick":
                            window.electronAPI?.sendMouseInput('right_click','click');
                            break;
                        default:
                            break;
                        }
                    }
                }
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
    add_on_message,
    audio_room_events,
    video_room_events,
    media_route_video,
    media_route_audio,
    pc_control_list

  }
})

// --------------------- Helper Functions ---------------------
function arrayBufferToObject(ab) {
  const jsonString = new TextDecoder('utf-8').decode(ab); // ↩︎ UTF-8 -> string
  return JSON.parse(jsonString);                          // ↩︎ string -> object
}