import {
  RemoteTrack,
  Room,
  RoomEvent,
  VideoPresets,
  Track,
} from "livekit-client";
import { useEffect, useRef } from "react";

export default function useLiveKit(
  liveKitToken: string,
  roomRef: React.MutableRefObject<Room | null>
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  roomRef.current = null;

  if (!liveKitToken) return null;

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

  useEffect(() => {
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
      } catch (error) {
        console.log(`error while connecting to live kit server ${error}`);
        return null;
      }
    })();
  }, []);

  return { videoRef, audioRef, room: roomRef.current };
}
