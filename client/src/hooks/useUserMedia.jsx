
export const useUserMedia = (requestedMedia) => {
  let mediaStream ;
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(requestedMedia);
        mediaStream = stream
      } catch(err) {
        console.log(err)
      }
    }

    if (!mediaStream) {
      enableStream();
    } else {
      return function cleanup() {
        mediaStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    }

  return mediaStream;
}
