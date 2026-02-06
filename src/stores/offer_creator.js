/* webrtc_offer_creator.js  – v2
 *  + acceptAnswerBase64(b64Answer)             <-- NEW
 */

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
          urls: [
            "turn:jo.vldo.in:3478?transport=udp",
          ],
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
    this.video_preview_two;
    this.ice_gather_time = 0
    this.time_of_ice_gather = 0
    this.dc_open = false
    this.dc.onopen = () => {
      console.log("[DC] open");
      this.dc_open = true
      setInterval(
        () =>{
          if(this.dc.readyState != "open") {
            console.log("DC singnal not stable yet. Waiting.")
            return
          }
          this.dc.send(
            JSON.stringify({ Type: "data", data: "ping from browser" })
          )
        },
        3000
      );
    };
    this.dc.onmessage = async (payload) => {
      if (payload.data instanceof ArrayBuffer) {
        const msg = arrayBufferToObject(payload.data);
        // console.log(msg);

        if (this.negotiating) return;

        if (msg.Type === "reload"){
          window.location.reload();
        }

        if (msg.Type === "offer") {
          this.negotiating = true;
          if(this.dc.readyState == "open") {
          this.dc.send("Got the offer will be accepted soon!");
          }
          else {
            await waitForDataChannelOpen(this.dc)
          }
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
            if(this.dc.readyState != "open") {
              waitForDataChannelOpen(this.dc).then(()=> {
                this.dc.send(
                JSON.stringify({
                  Type: "answer",
                  SDP: this.pc.localDescription.sdp,
                })
            )
              })
              return
            }
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

    let start = Date.now()
    console.time("ICE Gathering...");
    this.candidate_count = 0
    // await this.#waitForIceComplete();

    // await this.#waitForAtLeastOneCandidate();
    await this.#waitForCandidatesForDuration(500);
    
    console.log("Total candidates, ", this.candidate_count)
    if(this.candidate_count < 1) {
      await this.#waitForUpToTwoCandidates();
      if(this.candidate_count < 1) await this.#waitForAtLeastOneCandidate();
    }
    
    await this.#waitForSDPToContainCandidates();
    
    console.timeEnd("ICE Gathering...");
    this.ice_gather_time = Date.now() - start;
    console.log("connection monitor ", this.ice_gather_time)
    this.time_of_ice_gather = Date.now()

    // console.log(`[Offer from browser]: ${this.pc.localDescription.sdp}`);
    const offerB64 = btoa(this.pc.localDescription.sdp);
    // console.log(
    //   "\n=== BASE-64 SDP OFFER ===\n" + offerB64 + "\n=== /BASE-64 ===\n"
    // );
    return offerB64;
  }

  /** Accept a BASE-64 encoded ANSWER from the remote peer. */
  async acceptAnswerBase64(b64Answer) {
    // console.log(b64Answer);
    const sdp = atob(b64Answer.trim());
    const answer = new RTCSessionDescription({ type: "answer", sdp });

    await this.pc.setRemoteDescription(answer);
    console.log("[SIGNAL] remote answer applied");
  }

  async acceptOfferAndReturnAnswerBase64(b64Offer) {
  const sdp = atob(b64Offer.trim());
  const offer = new RTCSessionDescription({ type: "offer", sdp });

  // Add tracks like in makeOfferBase64
  const stream = await this.#getMediaStream();
  stream.getTracks().forEach((track) => this.pc.addTrack(track, stream));

  // Apply the remote offer
  await this.pc.setRemoteDescription(offer);

  // Create answer
  const answer = await this.pc.createAnswer();
  await this.pc.setLocalDescription(answer);

  // Wait for ICE gathering to complete
  console.log("waiting for ICE complete...")
  await this.#waitForAtLeastOneCandidate();
  await this.#waitForSDPToContainCandidates();

  // Return the answer SDP as base64
  const answerB64 = btoa(this.pc.localDescription.sdp);
  return answerB64;
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

  async #waitForAtLeastOneCandidate() {
  return new Promise((resolve) => {
    const onCandidate = (e) => {
      if (e.candidate) {
        this.pc.removeEventListener("icecandidate", onCandidate);
        resolve(); // 🔥 Got the first candidate, good to go
      }
    };

    this.pc.addEventListener("icecandidate", onCandidate);

    // fallback in case no candidates ever come (e.g., host-only network)
    setTimeout(() => {
      this.pc.removeEventListener("icecandidate", onCandidate);
      resolve();
    }, 1000); // ⏱️ wait max 1s
  });
}

async #waitForUpToTwoCandidates() {
  return new Promise((resolve) => {
    let count = 0;
    const onCandidate = (e) => {
      if (e.candidate) {
        count++;
        this.candidate_count = count
        if (count >= 2) {
          this.pc.removeEventListener("icecandidate", onCandidate);
          clearTimeout(timer);
          resolve(); // ✅ Got 2 candidates
        }
      }
    };

    this.pc.addEventListener("icecandidate", onCandidate);

    // ⏱️ Fallback timeout: if only 1 or 0 candidates come in 1s, return anyway
    const timer = setTimeout(() => {
      this.pc.removeEventListener("icecandidate", onCandidate);
      resolve();
    }, 5000);
  });
}

async #waitForCandidatesForDuration(durationMs = 500) {
  return new Promise((resolve) => {
    let count = 0;

    const onCandidate = (e) => {
      if (e.candidate) {
        count++;
        this.candidate_count = count;
      }
    };

    this.pc.addEventListener("icecandidate", onCandidate);

    const timer = setTimeout(() => {
      this.pc.removeEventListener("icecandidate", onCandidate);
      resolve(); // ✅ Return after 500 ms no matter how many candidates
    }, durationMs);
  });
}


async #waitForSDPToContainCandidates() {
  const hasCandidates = () =>
    this.pc.localDescription &&
    /a=candidate:/.test(this.pc.localDescription.sdp);

  if (hasCandidates()) return;

  return new Promise((resolve) => {
    const check = () => {
      if (hasCandidates()) {
        clearInterval(timer);
        resolve();
      }
    };
    const timer = setInterval(check, 50);

    // safety timeout
    setTimeout(() => {
      clearInterval(timer);
      resolve();
    }, 2000); // max 2 sec wait
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


