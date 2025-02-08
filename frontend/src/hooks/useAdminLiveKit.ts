import { Room, VideoPresets } from "livekit-client";
import { useEffect, useRef, useState } from "react";

export default function useAdminLiveKit(liveKitToken: string) {
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
          liveKitToken,
          {
            autoSubscribe: true,
          }
        );
        setConnection(true);
      } catch (error) {
        setConnection(false);
        return null;
      }
    })();

    return () => {
      room.disconnect();
    };
  }, [liveKitToken]);

  return { videoRef, screenShareRef, roomRef, connection };
}
