export async function replaceVideoTrackByDeviceId(pc, deviceId, woc) {
  try {
    const constraints = {
      video: {
        deviceId: { exact: deviceId },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const newTrack = stream.getVideoTracks()[0];

    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
    if (sender && newTrack) {
      await sender.replaceTrack(newTrack);
      console.log("📷 Video track replaced with device:", deviceId);
      woc?.video_preview?.srcObject = stream
      woc?.video_preview?.play()
    } else {
      console.warn("No video sender found or new track missing");
    }

    return stream;
  } catch (err) {
    console.error("Failed to switch video track:", err);
    return null;
  }
}

export async function replaceAudioTrackByDeviceId(pc, deviceId) {
  try {
    const constraints = {
      audio: {
        deviceId: { exact: deviceId },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const newTrack = stream.getAudioTracks()[0];

    const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
    if (sender && newTrack) {
      await sender.replaceTrack(newTrack);
      console.log("🎙️ Audio track replaced with device:", deviceId);
    } else {
      console.warn("No audio sender found or new track missing");
    }

    return stream;
  } catch (err) {
    console.error("Failed to switch audio track:", err);
    return null;
  }
}

// module.exports = {
//     replaceVideoTrackByDeviceId,
//     replaceAudioTrackByDeviceId
// }