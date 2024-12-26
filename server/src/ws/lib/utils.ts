import { roomsInfo } from "../room/RoomManager";
import WebSocket from "ws";

export function BroadCastMessage(
    roomId: string,
    ws: WebSocket,
    messageData: string | object
  ) {
    const room = roomsInfo.get(roomId)?.users;
    if (!room) {
      ws.send(JSON.stringify({ msg: "No room exist with this roomId" }));
      return;
    }
  
    room.forEach((user: WebSocket) => {
      if (user.OPEN && user != ws) {
        //don't send the message to the admin also
        user.send(JSON.stringify({ msg: messageData }));
      }
    });
  }
  