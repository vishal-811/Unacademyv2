import WebSocket from "ws";
import { BroadCastMessage } from "../room/RoomManager";
import { ExcaliDrawEventData } from "../types";

export function handleExcaliDrawEvent (data : ExcaliDrawEventData,ws: WebSocket){
    if(!data){
        ws.send("please provide a roomId");
    }
    const { roomId, excaliEvent } = data;
    
    BroadCastMessage(roomId,ws,excaliEvent);
    // Write in a kafka for the record. 
}