import WebSocket from "ws";
import { UserTokenData } from "./types";
import { handleJoinRoom, handleLeaveRoom } from "./room/RoomManager";
import { handleExcaliDrawEvent } from "./excalidraw/ExcaliDrawEvents";
import { handleSwitchEvent } from "./switchevents";

export function handleWebsocketCloseEvent() {}

export function handleWebsocketMessageEvent(
  message: string,
  ws: WebSocket,
  userToken: UserTokenData
) {
  console.log("hit the handle websocket message function")
  const parsedData = JSON.parse(message.toString());
  const { type, data } = parsedData;
  const { id, role } = userToken;

  switch (type) {
    case "join_room": {
      handleJoinRoom(data, ws, userToken);
      break;
    }
    case "leave_room": {
      console.log("hit the switch case to leave the room")
      handleLeaveRoom(data, ws, role);
      break;
    }
    case "excali_draw_event": {
      handleExcaliDrawEvent(data, ws);
      break;
    }
    case "switch_event": {
      handleSwitchEvent(data, ws);
      break;
    }
  }
}
