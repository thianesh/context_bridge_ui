async function waitForSignalingStable(pc) {
  if (pc.signalingState === "stable") return;

  return new Promise(resolve => {
    const checkStable = () => {
      if (pc.signalingState === "stable") {
        pc.removeEventListener("signalingstatechange", checkStable);
        resolve();
      }
    };
    pc.addEventListener("signalingstatechange", checkStable);
  });
}

async function waitForDataChannelOpen(dataChannel) {
  if (dataChannel.readyState === "open") return;

  return new Promise(resolve => {
    const checkOpen = () => {
      if (dataChannel.readyState === "open") {
        dataChannel.removeEventListener("open", checkOpen);
        resolve();
      }
    };
    dataChannel.addEventListener("open", checkOpen);
  });
}

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {webrtc_offer_creator } from "./offer_creator"
import { useStorage } from '@vueuse/core'

function shallowCompareLevel2(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Quick check on number of top-level keys
  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!(key in obj2)) return false;

    const val1 = obj1[key];
    const val2 = obj2[key];

    // If one is object and the other isn't, not equal
    const isObj1 = val1 && typeof val1 === 'object';
    const isObj2 = val2 && typeof val2 === 'object';

    if (isObj1 && isObj2) {
      const subKeys1 = Object.keys(val1);
      const subKeys2 = Object.keys(val2);
      if (subKeys1.length !== subKeys2.length) return false;

      for (const subKey of subKeys1) {
        if (!(subKey in val2)) return false;
        if (val1[subKey] !== val2[subKey]) return false;
      }
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
}

export const webrtc_store = defineStore('webrtc_store', () => {

    const woc = new webrtc_offer_creator();
    const signal_state_stable = ref(false)
    const members_online = ref({})
    const members_online_list = ref([])
    const video_room_events = ref({})
    const audio_room_events = ref({})
    const media_route_video = ref({})
    const media_route_audio = ref({})
    const allow_pc_control = useStorage("allow_pc_control", false)
    const pc_control_list = useStorage('pc_control_list',{})
    const chat_messages = ref([
       
    ])
    const  activity_map = ref({})
    const last_ping_received = ref(Date.now())
    const connection_lost = ref(false)
    const connection_verified = ref(false)
    const join_message_sent = ref(false)
    const join_timestamp = ref(null)

    const raise_hand = ref([])
    const thumbs_up = ref([])

    function add_raise_hand(member_id){
        raise_hand.value.push(member_id)
        setTimeout(() => {
            remove_raise_hand(member_id)
        }, 9000);
    }
    
    function remove_raise_hand(member_id) {
        raise_hand.value = raise_hand.value.filter(item => item !== member_id);
    }

    function add_thumbs_up(member_id){
        thumbs_up.value.push(member_id)
        setTimeout(() => {
            remove_thumbs_up(member_id)
        }, 9000);
    }
    
    function remove_thumbs_up(member_id) {
        thumbs_up.value = thumbs_up.value.filter(item => item !== member_id);
    }

    function cleanup_member_state(member_id) {
        // Remove from video room events
        if (video_room_events.value[member_id]) {
            const { [member_id]: _, ...restVideo } = video_room_events.value;
            video_room_events.value = restVideo;
        }
        
        // Remove from audio room events
        if (audio_room_events.value[member_id]) {
            const { [member_id]: _, ...restAudio } = audio_room_events.value;
            audio_room_events.value = restAudio;
        }
        
        // Remove from media routes
        if (media_route_video.value[member_id]) {
            const { [member_id]: _, ...restMediaVideo } = media_route_video.value;
            media_route_video.value = restMediaVideo;
        }
        
        if (media_route_audio.value[member_id]) {
            const { [member_id]: _, ...restMediaAudio } = media_route_audio.value;
            media_route_audio.value = restMediaAudio;
        }
        
        // Remove from activity map
        if (activity_map.value[member_id]) {
            const { [member_id]: _, ...restActivity } = activity_map.value;
            activity_map.value = restActivity;
        }
        
        // Remove from raise hand and thumbs up
        remove_raise_hand(member_id);
        remove_thumbs_up(member_id);
        
        // Update members_online_list
        members_online_list.value = members_online_list.value.filter(
            item => item.member_id !== member_id
        );
        
        console.log(`Cleaned up state for disconnected member: ${member_id}`);
    }

    function handle_members_offline(previousMembers, currentMembers) {
        const previousIds = Object.keys(previousMembers);
        const currentIds = Object.keys(currentMembers);
        
        // Find members who went offline
        const offlineMembers = previousIds.filter(id => !currentIds.includes(id));
        
        // Clean up state for each offline member
        offlineMembers.forEach(memberId => {
            cleanup_member_state(memberId);
        });
    }

    async function create_root_offer(){
        const base64Sdp = await woc.makeOfferBase64();
        return base64Sdp
    }

    async function accept_answer(sdp) {
        await woc.acceptAnswerBase64(sdp)
        await waitForSignalingStable(woc.pc)
        console.log("signal state stable.")
        signal_state_stable.value = true
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
                const previousMembers = members_online.value;
                const currentMembers = msg.data.active_users;
                
                // Check for members who went offline and clean up their state
                handle_members_offline(previousMembers, currentMembers);
                
                if(!shallowCompareLevel2(previousMembers, currentMembers)) members_online.value = currentMembers;
                // Update ping timestamp on any message from server
                last_ping_received.value = Date.now()
                connection_lost.value = false
            }

            if (msg.event == "ping" || msg.Type == "ping") {
                last_ping_received.value = Date.now()
                connection_lost.value = false
                // Send pong response
                const dc = woc.get_data_channel()
                if (dc && dc.readyState === 'open') {
                    dc.send(JSON.stringify({ Type: "pong" }))
                }
            }

            else if (msg.event == "video_room_event") {
                video_room_events.value = {
                    ...video_room_events.value,
                    ...msg
                }
                members_online_list.value = Object.keys(video_room_events.value).map(key =>  {
                    return {
                        ...video_room_events.value[key],
                        member_id: key,
                    }
                })
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
            await waitForDataChannelOpen(woc.dc)
            if(woc.dc.readyState == "open") {
                woc.dc.send("Got the offer will be accepted soon!");
            }
            console.log("Got the offer will be accepted soon!");

            const offer = new RTCSessionDescription({
                type: 'offer',
                sdp: msg.SDP,
            });

            await woc.pc.setRemoteDescription(offer);
            const answer = await woc.pc.createAnswer();
            await woc.pc.setLocalDescription(answer); // set first to trigger ICE gathering

            const sendAnswer = async () => {
                console.log(">>>>>>>>>>>>>>>>>>>>>>> Sending Answer <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                await waitForDataChannelOpen(woc.dc)
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
            if (msg.Type === "route_to") {
                    const data = JSON.parse(msg.data)
                    const payload = data.payload

                    if (data) {
                        // console.log("other events: ",data)
                        switch (data.type) {
                        case "raiseHand":
                            add_raise_hand(payload.member_id)
                            activity_map.value[payload.member_id] = Date.now()
                            break
                        case "raiseHandRemove":
                            remove_raise_hand(payload.member_id)
                            break
                        case "thumbsUp":
                            add_thumbs_up(payload.member_id)
                            activity_map.value[payload.member_id] = Date.now()
                            break
                        case "thumbsUpRemove":
                            remove_thumbs_up(payload.member_id)
                            break
                        case "chat":
                            chat_messages.value.push({
                                ...payload,
                                time: new Date(payload.time)
                            })
                            // Verify connection if this is our join message echoed back
                            if (join_message_sent.value && !connection_verified.value && payload.join_timestamp === join_timestamp.value) {
                                connection_verified.value = true
                                console.log("Connection verified - join message echoed back with matching timestamp:", payload.join_timestamp)
                            }
                            break
                        }
                    }
            }
            if (msg.Type === 'route_to'){
                
                
                if (!allow_pc_control.value) return;
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

function is_electron() {
    if(window?.electronAPI) true;
    return false
}

  function send_join_notification(userName, userId, onlineMembers) {
    join_message_sent.value = true
    connection_verified.value = false
    const timestamp = Date.now()
    join_timestamp.value = timestamp
    
    const dc = woc.get_data_channel()
    if (dc && dc.readyState === 'open') {
      const joinTime = new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      const joinMessage = `${userName} joined at ${joinTime}`
      
      // Send to self (for verification echo) and all online members
      const recipients = [userId, ...Object.keys(onlineMembers).filter(id => id !== userId)]
      
      recipients.forEach(memberId => {
        dc.send(JSON.stringify({
          Type: "route_to",
          route_to: memberId,
          data: JSON.stringify({
            type: "chat",
            payload: {
              name: "System",
              message: joinMessage,
              time: timestamp,
              member_id: "system",
              join_timestamp: timestamp  // Used for verification
            }
          })
        }))
      })
      console.log("Sent join notification with timestamp:", timestamp)
    }
  }

  function reset_verification() {
    connection_verified.value = false
    join_message_sent.value = false
    join_timestamp.value = null
  }

  return {
    is_electron,
    activity_map,
    raise_hand,
    thumbs_up,
    add_raise_hand,
    remove_raise_hand,
    add_thumbs_up,
    remove_thumbs_up,
    cleanup_member_state,
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
    pc_control_list,
    allow_pc_control,
    chat_messages,
    members_online_list,
    last_ping_received,
    connection_lost,
    connection_verified,
    join_message_sent,
    send_join_notification,
    reset_verification,
  }
})

// --------------------- Helper Functions ---------------------
function arrayBufferToObject(ab) {
  const jsonString = new TextDecoder('utf-8').decode(ab); // ↩︎ UTF-8 -> string
  return JSON.parse(jsonString);                          // ↩︎ string -> object
}