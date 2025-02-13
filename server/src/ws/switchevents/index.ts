import WebSocket from "ws";
import { SwitchEvent } from "../types";
import { Current_Room_State, roomsInfo, RoomState } from "../room/RoomManager";
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
      Current_Room_State.state = RoomState.Video;
      BroadCastMessage(roomId, ws, {
        msg: "switch to video successfully",
        state: Current_Room_State.state
      });
      break;
    }
    case "switch_to_excalidraw": {
      Current_Room_State.state= RoomState.ExcaliDraw;
      BroadCastMessage(roomId, ws, {
        msg: "switch to excalidraw successfully",
        state: Current_Room_State.state
      });
      break;
    }
    case "switch_to_screen_share": {
     Current_Room_State.state = RoomState.ScreenShare;
      BroadCastMessage(roomId, ws, {
        msg: "switch to screen share successfully",
        state : Current_Room_State.state
      });
      break;
    }
    case "switch_to_slides": {
      Current_Room_State.state = RoomState.slides;
      BroadCastMessage(roomId, ws, {
        msg: "switch to slides successfully",
        state: Current_Room_State.state
      });
      break;
    }
    default: {
      console.log("wrong event changes");
    }
  }
};
