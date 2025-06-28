/* webrtc_offer_creator.js  – v2
 *  + acceptAnswerBase64(b64Answer)             <-- NEW
 */

function arrayBufferToObject(ab) {
  const jsonString = new TextDecoder("utf-8").decode(ab); // ↩︎ UTF-8 -> string
  return JSON.parse(jsonString); // ↩︎ string -> object
}

export class webrtc_offer_creator {
  /* --------------------------- ctor ------------------------------------ */
  constructor(
    rtcConfig = {
      iceServers: [
        {
          urls: "turn:jo.vldo.in:3478?transport=udp",
          username: "thianesh",
          credential: "kjroitshhinmaanni",
        },
      ],
      iceTransportPolicy: "all",
    }
  ) {
    this.pc = new RTCPeerConnection(rtcConfig);
    this.dc = this.pc.createDataChannel("data");
    this.video_preview;
    this.dc.onopen = () => {
      console.log("[DC] open");
      setInterval(
        () =>
          this.dc.send(
            JSON.stringify({ Type: "data", data: "ping from browser" })
          ),
        3000
      );
    };
    this.dc.onmessage = async (payload) => {
      if (payload.data instanceof ArrayBuffer) {
        const msg = arrayBufferToObject(payload.data);
        // console.log(msg);

        if (this.negotiating) return;

        if (msg.Type === "offer") {
          this.negotiating = true;
          this.dc.send("Got the offer will be accepted soon!");
          console.log("Got the offer will be accepted soon!");

          const offer = new RTCSessionDescription({
            type: "offer",
            sdp: msg.SDP,
          });

          await this.pc.setRemoteDescription(offer);
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer); // set first to trigger ICE gathering

          const sendAnswer = () => {
            console.log(
              ">>>>>>>>>>>>>>>>>>>>>>> Sending Answer <<<<<<<<<<<<<<<<<<<<<<<<<<<<"
            );
            this.dc.send(
              JSON.stringify({
                Type: "answer",
                SDP: this.pc.localDescription.sdp,
              })
            );
          };

          if (this.pc.iceGatheringState === "complete") {
            sendAnswer();
          } else {
            await new Promise((resolve) => {
              const handler = () => {
                if (this.pc.iceGatheringState === "complete") {
                  this.pc.removeEventListener(
                    "icegatheringstatechange",
                    handler
                  );
                  resolve();
                }
              };
              this.pc.addEventListener("icegatheringstatechange", handler);
            });
            sendAnswer();
          }
          this.negotiating = false;
        }
      } else {
        // console.log('[DC] msg:', payload);
      }
    };
    // this.makeOfferBase64()
  }

  get_data_channel() {
    return this.dc;
  }
  /* -------------------- signalling helpers ----------------------------- */
  /** Create the initial OFFER (data-channel only) and return it as base-64 */
  async makeOfferBase64() {
    const stream = await this.#getMediaStream();
    stream.getTracks().forEach((track) => this.pc.addTrack(track, stream));

    const d = await this.pc.createOffer();
    await this.pc.setLocalDescription(d);

    await this.#createAndSetOffer();

    console.time("ICE Gathering...");
    await this.#waitForIceComplete();
    console.timeEnd("ICE Gathering...");

    console.log(`[Offer from browser]: ${this.pc.localDescription.sdp}`);
    const offerB64 = btoa(this.pc.localDescription.sdp);
    console.log(
      "\n=== BASE-64 SDP OFFER ===\n" + offerB64 + "\n=== /BASE-64 ===\n"
    );
    return offerB64;
  }

  /** Accept a BASE-64 encoded ANSWER from the remote peer. */
  async acceptAnswerBase64(b64Answer) {
    console.log(b64Answer);
    const sdp = atob(b64Answer.trim());
    const answer = new RTCSessionDescription({ type: "answer", sdp });

    await this.pc.setRemoteDescription(answer);
    console.log("[SIGNAL] remote answer applied");
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
    if (this.pc.iceGatheringState === "complete") return;
    await new Promise((res) => {
      const f = () =>
        this.pc.iceGatheringState === "complete" &&
        (this.pc.removeEventListener("icegatheringstatechange", f), res());
      this.pc.addEventListener("icegatheringstatechange", f);
    });
  }

  async #getMediaStream() {
    // try {
    //   return await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    // } catch (err) {
    //   console.warn('Partial media access or error, falling back:', err);

    //   const tracks = [];

    //   try {
    //     const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
    //     tracks.push(...audio.getTracks());
    //   } catch (e) {
    //     console.warn('No mic access');
    //   }

    //   try {
    //     const video = await navigator.mediaDevices.getUserMedia({ video: true });
    //     tracks.push(...video.getTracks());
    //   } catch (e) {
    //     console.warn('No camera access');
    //   }

    //   return new MediaStream(tracks);
    // }
    const stream = new MediaStream();

    let gotAudio = false;
    let gotVideo = false;

    // Try real audio
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      micStream.getAudioTracks().forEach((track) => stream.addTrack(track));
      gotAudio = true;
    } catch (e) {
      console.warn("Mic access denied or failed");
    }

    // Try real video
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.camStream = camStream

      camStream.getVideoTracks().forEach((track) => stream.addTrack(track));
      gotVideo = true;
    } catch (e) {
      console.warn("Camera access denied or failed");
    }

    // Add silent audio if missing
    if (!gotAudio) {
      stream.addTrack(createSilentAudioTrack());
    }

    // Add black video if missing
    if (!gotVideo) {
      stream.addTrack(this.createBlackVideoTrack());
    }

    return stream;
  }

  async stop_share() {
    this.switchToCameraOrFallback()
    this.video_preview.srcObject = this.videoStreamBlack
  }

  async share_screen() {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    this.video_preview.srcObject = screen
    this.video_preview.play()

    const videoSender = this.pc
      .getSenders()
      .find((s) => s.track?.kind === "video");
    if (videoSender) {
      await videoSender.replaceTrack(screen.getVideoTracks()[0]);
    }

    // const audioSender = this.pc.getSenders().find(s => s.track?.kind === 'audio');
    // if (audioSender && screen.getAudioTracks().length) {
    //   await audioSender.replaceTrack(screen.getAudioTracks()[0]);
    // }
    this.monitorScreenShareStop(screen);
  }

  async monitorScreenShareStop(stream) {
    const [screenTrack] = stream.getVideoTracks();
    if (!screenTrack) return;

    screenTrack.onended = () => {
      console.log("📴 Screen share stopped by user");
      this.switchToCameraOrFallback(); // fallback to camera or black screen
    };
  }

  async switchToCameraOrFallback() {
    let gotAudio = false;
    let gotVideo = false;

    let audioTrack = null;
    let videoTrack = null;

    // Try getting audio
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioTrack = audioStream.getAudioTracks()[0];
      gotAudio = true;
    } catch (err) {
      console.warn("Mic access failed. Using silent track.");
    }

    // Try getting video
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.camStream = videoStream
      this.video_preview.srcObject = videoStream
      this.video_preview.play()
      videoTrack = videoStream.getVideoTracks()[0];
      gotVideo = true;
    } catch (err) {
      console.warn("Camera access failed. Using black track.");
    }

    if (!gotAudio) {
      audioTrack = createSilentAudioTrack();
    }

    if (!gotVideo) {
      videoTrack = this.createBlackVideoTrack();
    }

    // Replace audio track in peer connection
    const audioSender = this.pc
      .getSenders()
      .find((s) => s.track?.kind === "audio");
    if (audioSender && audioTrack) {
      await audioSender.replaceTrack(audioTrack);
      console.log("🎙️ Replaced audio track");
    }

    // Replace video track in peer connection
    const videoSender = this.pc
      .getSenders()
      .find((s) => s.track?.kind === "video");
    if (videoSender && videoTrack) {
      await videoSender.replaceTrack(videoTrack);
      console.log("📹 Replaced video track");
    }
  }

  createBlackVideoTrack(width = 640, height = 480, fps = 10) {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // keep the video stream alive
    setInterval(() => {
      ctx.fillRect(0, 0, width, height);
    }, 1000 / fps);
    
    this.videoStreamBlack = canvas.captureStream(fps)

    const track = this.videoStreamBlack.getVideoTracks()[0];
    track.enabled = false;
    return track;
  }
}

function createSilentAudioTrack() {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = ctx.createMediaStreamDestination();
  const gain = ctx.createGain();

  gain.gain.value = 0; // silence
  oscillator.connect(gain).connect(dst);
  oscillator.start();

  const track = dst.stream.getAudioTracks()[0];
  track.enabled = false;
  return track;
}


