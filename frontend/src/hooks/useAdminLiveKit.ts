import { Room, VideoPresets } from "livekit-client";
import { useEffect, useRef, useState } from "react";

export default function useAdminLiveKit(
  liveKitToken: string,
//   roomRef: React.MutableRefObject<Room | null>
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const [connection, setConnection] = useState<boolean>(false);

  useEffect(() => {
    if (!liveKitToken) {
      console.log("Livekit token is missing in admin");
      return;
    }
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
    });

    roomRef.current = room;

    (async () => {
      try {
        await roomRef.current?.prepareConnection(
          "wss://unacademy-7fpyqjfj.livekit.cloud",
          liveKitToken
        );
        await roomRef.current?.connect(
          "wss://unacademy-7fpyqjfj.livekit.cloud",
          liveKitToken
        );

        setConnection(true);
      } catch (error) {
        console.log(`error while connecting to the live kit server ${error}`);
        return null;
      }
    })();
  }, [liveKitToken]);

  return { videoRef, screenShareRef, roomRef, connection };
}
