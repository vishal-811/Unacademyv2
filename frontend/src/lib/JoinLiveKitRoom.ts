import { Room, VideoPresets } from "livekit-client";

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
  try {
    await roomRef.current.prepareConnection(
      "wss://unacademy-7fpyqjfj.livekit.cloud",
      liveKitToken
    );
    await roomRef.current.connect(
      "wss://unacademy-7fpyqjfj.livekit.cloud",
      liveKitToken
    );
    return roomRef.current;
  } catch (error) {
    console.log(`error while connecting to live kit server ${error}`);
    return null;
  }
}
