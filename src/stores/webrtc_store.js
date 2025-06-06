import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {webrtc_offer_creator } from "./offer_creator"

export const webrtc_store = defineStore('webrtc_store', () => {

    const woc = new webrtc_offer_creator();

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

  return {
    get_woc,
    create_root_offer,
    close_root_offer,
    accept_answer
  }
})