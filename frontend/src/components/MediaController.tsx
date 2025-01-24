import { useEffect, useRef } from "react";

export function MediaController() {
  const MediaStreamRef = useRef<HTMLVideoElement | null>(null);
  let mediaStream: MediaStream | null = null;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaStream = stream;
        if (MediaStreamRef.current) {
          MediaStreamRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.log(`something went wrong with the media stream ${error}`);
      });

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);
  return (
    <div className="w-full h-full">
      <video ref={MediaStreamRef} autoPlay className="w-full h-full" />
    </div>
  );
}
