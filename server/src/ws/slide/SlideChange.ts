import webSocket from "ws";
import { BroadCastMessage } from "../lib/utils";

interface slideChangeType {
  roomId: string;
  imageId: string;
}

export function handleSlideChange(data: slideChangeType, ws: webSocket) {
  const { roomId, imageId } = data;

  BroadCastMessage(roomId, ws, { roomId, imageId });
  console.log("Slide change event send to the frontend");
}
