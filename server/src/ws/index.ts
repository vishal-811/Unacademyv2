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
  const parsedData = JSON.parse(message.toString());
  console.log("the data from the sender side is", parsedData);
  const { type, data } = parsedData;
  const { id, role } = userToken;

  switch (type) {
    case "join_room": {
      handleJoinRoom(data, ws, userToken);
      break;
    }
    case "leave_room": {
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
