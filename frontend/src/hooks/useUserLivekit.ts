import {
  Room,
  VideoPresets,
  RoomEvent,
  Track,
  RemoteTrack,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";

export default function useUserLiveKit(liveKitToken: string) {
  const [connection, setConnection] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
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
      if (track.kind === Track.Kind.Video && track.source === "screen_share") {
        console.log("screen share track")
        track.attach(screenShareRef.current!);
      } else if (track.kind === Track.Kind.Video) {
        track.attach(videoRef.current!);
      }
      if (track.kind === Track.Kind.Audio) {
        track.attach(audioRef.current!);
        audioRef.current!.muted = false;
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
      } catch (error) {
        console.log(`error while connecting to live kit server ${error}`);
        return null;
      }
    })();
  }, [liveKitToken]);

  return { videoRef, audioRef, screenShareRef, roomRef, connection };
}
