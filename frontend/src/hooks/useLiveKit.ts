import {
  RemoteTrack,
  Room,
  RoomEvent,
  VideoPresets,
  Track,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";

export default function useLiveKit(
  liveKitToken: string,
  roomRef: React.MutableRefObject<Room | null>
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [connection, setConnection] = useState<boolean>(false);

  useEffect(() => {
    console.log("the custom hook is called");
    if (!liveKitToken) {
      console.error("LiveKit token is missing!");
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

    roomRef.current.on(RoomEvent.TrackSubscribed, handleTrackSubscribe);

    function handleTrackSubscribe(track: RemoteTrack) {
      console.log("track is", track);

      if (track.kind === Track.Kind.Video) {
        track.attach(videoRef.current!);
      }
      if (track.kind === Track.Kind.Audio) {
        track.attach(audioRef.current!);
      }
    }

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
        console.log("connected to the livekit server");
      } catch (error) {
        console.log(`error while connecting to live kit server ${error}`);
        return null;
      }
    })();
  }, [liveKitToken]);

  return { videoRef, audioRef, room: roomRef.current, connection };
}
