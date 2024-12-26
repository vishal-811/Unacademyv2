import WebSocket from "ws";
import { SwitchEvent } from "../types";
import { roomsInfo } from "../room/RoomManager";
import { BroadCastMessage } from "../lib/utils";

export const  handleSwitchEvent = (data: SwitchEvent, ws: WebSocket) => {
    const {roomId, eventType} = data;
    
    if(!roomId){
        ws.send(JSON.stringify({msg :"Please provide a roomId"}));
        return;
    }
    const room = roomsInfo.get(roomId);
    if(!room){
        ws.send(JSON.stringify({msg :"No room exist with this roomId"}));
        return;
    }
    switch (eventType) {
        case "switch_to_video" :{
            BroadCastMessage(roomId, ws, {msg :"switch to video successfully", data: "video"});
          break;
        }
        case "switch_to_excalidraw" :{
            BroadCastMessage(roomId, ws, {msg :"switch to excalidraw successfully", data :"excalidraw"});
        }
    }
}

