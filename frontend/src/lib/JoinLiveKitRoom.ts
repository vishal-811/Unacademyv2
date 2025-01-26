import { RemoteTrack, Room, RoomEvent, VideoPresets } from "livekit-client";

export async function JoinLiveKitServer(
  liveKitToken: string,
  roomRef: React.MutableRefObject<Room | null>
): Promise<Room | null> {
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
    // if (track.kind === Track.Kind.Video) {
    //   track.attach(videoRef.current!);
    // }
    // if (track.kind === Track.Kind.Audio) {
    //   track.attach(audioRef.current!);
    // }
  }

  try {
    await roomRef.current.prepareConnection(
      "wss://unacademy-7fpyqjfj.livekit.cloud",
      liveKitToken
    );
    await roomRef.current.connect(
      "wss://unacademy-7fpyqjfj.livekit.cloud",
      liveKitToken,
      {
        autoSubscribe: true,
      }
    );
    return roomRef.current;
  } catch (error) {
    console.log(`error while connecting to live kit server ${error}`);
    return null;
  }
}
