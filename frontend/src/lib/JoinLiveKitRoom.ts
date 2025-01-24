import { Room } from "livekit-client";

export async function JoinLiveKitServer(liveKitToken : string, roomRef : React.MutableRefObject<Room | null>): Promise<Room | null> {
  console.log("join livekit server hitted");
  roomRef.current = null;

  if (!liveKitToken) return null;
  const  room   = new Room();
  roomRef.current = room;
  try {
    console.log("the roomRef id is", roomRef);
    await roomRef.current.prepareConnection("wss://unacademy-7fpyqjfj.livekit.cloud", liveKitToken);
    await roomRef.current.connect("wss://unacademy-7fpyqjfj.livekit.cloud", liveKitToken);
    console.log("Connected to the livekit server success");
    return roomRef.current;
  } catch (error) {
    console.log(`error while connecting to live kit server ${error}`);
    return null;
  }
}
