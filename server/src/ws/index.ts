import WebSocket from "ws";
import { UserTokenData } from "./types";
import { handleJoinRoom, handleLeaveRoom } from "./room/RoomManager";
import { handleExcaliDrawEvent } from "./excalidraw/ExcaliDrawEvents";
import { handleSwitchEvent } from "./switchevents";
import { handleChatEvent } from "./chat/ChatEvent";

export function handleWebsocketCloseEvent() {}

export function handleWebsocketMessageEvent(
  message: string,
  ws: WebSocket,
  userToken: UserTokenData
) {
  const parsedData = JSON.parse(message.toString());
  const { type, data } = parsedData;
  const role = userToken.role;
  switch (type) {
    case "join_room": {
      handleJoinRoom(data, ws, userToken);
      break;
    }
    case "leave_room": {
      handleLeaveRoom(data, ws, role!);
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
    case "chat_event": {
      handleChatEvent(data, ws);
      break;
    }
  }
}
