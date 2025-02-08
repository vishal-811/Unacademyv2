import WebSocket from "ws";
import { SwitchEvent } from "../types";
import { roomsInfo, RoomState } from "../room/RoomManager";
import { BroadCastMessage } from "../lib/utils";

export const handleSwitchEvent = (data: SwitchEvent, ws: WebSocket) => {
  const { roomId, eventType } = data;
  if (!roomId) {
    ws.send(JSON.stringify({ msg: "Please provide a roomId" }));
    return;
  }
  const room = roomsInfo.get(roomId);
  if (!room) {
    ws.send(JSON.stringify({ msg: "No room exist with this roomId" }));
    return;
  }
  switch (eventType) {
    case "switch_to_video": {
      room.state = RoomState.Video;
      BroadCastMessage(roomId, ws, {
        msg: "switch to video successfully",
        data: "video",
      });
      break;
    }
    case "switch_to_excalidraw": {
      room.state = RoomState.ExcaliDraw;
      BroadCastMessage(roomId, ws, {
        msg: "switch to excalidraw successfully",
        data: "excalidraw",
      });
      break;
    }
    case "switch_to_screen_share": {
      room.state = RoomState.ScreenShare;
      BroadCastMessage(roomId, ws, {
        msg: "switch to screen share successfully",
        data: "screen_share",
      });
      break;
    }
    case "switch_to_slides": {
      room.state = RoomState.slides;
      BroadCastMessage(roomId, ws, {
        msg: "switch to slides successfully",
        data: "slides",
      });
      break;
    }
    default: {
      console.log("wrong event changes");
    }
  }
};
