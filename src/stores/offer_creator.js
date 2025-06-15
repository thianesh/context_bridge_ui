/* webrtc_offer_creator.js  – v2
 *  + acceptAnswerBase64(b64Answer)             <-- NEW
 */

function arrayBufferToObject(ab) {
  const jsonString = new TextDecoder('utf-8').decode(ab); // ↩︎ UTF-8 -> string
  return JSON.parse(jsonString);                          // ↩︎ string -> object
}

export class webrtc_offer_creator {
  /* --------------------------- ctor ------------------------------------ */
  constructor(rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }) {
    this.pc  = new RTCPeerConnection(rtcConfig);
    this.dc  = this.pc.createDataChannel('data');
    this.dc.onopen    = () =>  {
      console.log('[DC] open');
      setInterval(() => this.dc.send( JSON.stringify( { Type: "data", data: "ping from browser"} ) ), 3000)
    }
    this.dc.onmessage = async (payload) => {
      if (payload.data instanceof ArrayBuffer) {
        const msg = arrayBufferToObject(payload.data);
        console.log(msg);
        
        if(this.negotiating) return

        if (msg.Type === 'offer') {
          this.negotiating = true
          this.dc.send("Got the offer will be accepted soon!");
          console.log("Got the offer will be accepted soon!");

          const offer = new RTCSessionDescription({
            type: 'offer',
            sdp: msg.SDP,
          });

          await this.pc.setRemoteDescription(offer);
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer); // set first to trigger ICE gathering

          const sendAnswer = () => {
            console.log(">>>>>>>>>>>>>>>>>>>>>>> Sending Answer <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
            this.dc.send(
              JSON.stringify({ Type: 'answer', SDP: this.pc.localDescription.sdp })
            );
          };

          if (this.pc.iceGatheringState === 'complete') {
            sendAnswer();
          } else {
            await new Promise((resolve) => {
              const handler = () => {
                if (this.pc.iceGatheringState === 'complete') {
                  this.pc.removeEventListener('icegatheringstatechange', handler);
                  resolve();
                }
              };
              this.pc.addEventListener('icegatheringstatechange', handler);
            });
            sendAnswer();
          }
          this.negotiating = false
        }
      } else {
        // console.log('[DC] msg:', payload);
      }
    }
    this._negotiationLock = false;          // serialises renegotiations
  }

  get_data_channel() {
    return this.dc;
  }
  /* -------------------- signalling helpers ----------------------------- */
  /** Create the initial OFFER (data-channel only) and return it as base-64 */
  async makeOfferBase64() {
    
    const stream = await this.#getMediaStream();
    stream.getTracks().forEach(track => this.pc.addTrack(track, stream))

    const d = await this.pc.createOffer()
    await this.pc.setLocalDescription(d)

    await this.#createAndSetOffer();
    await this.#waitForIceComplete();

    console.log(`[Offer from browser]: ${this.pc.localDescription.sdp}`)
    const offerB64 = btoa(this.pc.localDescription.sdp);
    console.log('\n=== BASE-64 SDP OFFER ===\n' + offerB64 + '\n=== /BASE-64 ===\n');
    return offerB64;
  }

  /** Accept a BASE-64 encoded ANSWER from the remote peer. */
  async acceptAnswerBase64(b64Answer) {
    console.log(b64Answer)
    const sdp = atob(b64Answer.trim());
    const answer = new RTCSessionDescription({ type: 'answer', sdp });

    await this.pc.setRemoteDescription(answer);
    console.log('[SIGNAL] remote answer applied');
  }

  /* --------------------------- teardown -------------------------------- */
  close() {
    this.dc?.close();
    this.pc?.getSenders().forEach((s) => s.track?.stop());
    this.pc?.close();
  }

  /* ===================== private utilities ============================= */
  async #createAndSetOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
  }

  async #waitForIceComplete() {
    if (this.pc.iceGatheringState === 'complete') return;
    await new Promise((res) => {
      const f = () => this.pc.iceGatheringState === 'complete' && (this.pc.removeEventListener('icegatheringstatechange', f), res());
      this.pc.addEventListener('icegatheringstatechange', f);
    });
  }

  async #getMediaStream() {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (err) {
      console.warn('Partial media access or error, falling back:', err);

      const tracks = [];

      try {
        const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
        tracks.push(...audio.getTracks());
      } catch (e) {
        console.warn('No mic access');
      }

      try {
        const video = await navigator.mediaDevices.getUserMedia({ video: true });
        tracks.push(...video.getTracks());
      } catch (e) {
        console.warn('No camera access');
      }

      return new MediaStream(tracks);
    }
  }
}
