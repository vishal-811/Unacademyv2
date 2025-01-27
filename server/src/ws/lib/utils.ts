import { roomsInfo } from "../room/RoomManager";
import WebSocket from "ws";
import { ChatResponse } from "../types";

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
  

  export function BroadCastMessageInRoom(roomId:string, ws: WebSocket,message : ChatResponse){
    const room = roomsInfo.get(roomId);
    if(!room){
      ws.send(JSON.stringify({msg : 'No room exist with this roomId'}));
      return;
    }

    room.users.map((user) => {
      console.log("the response data is", message)
      user.send(JSON.stringify({msg : message}))
    })
  }