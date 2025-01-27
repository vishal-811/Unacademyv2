import WebSocket from "ws";
import { ChatEventData } from "../types";
import { BroadCastMessageInRoom } from "../lib/utils";



export function handleChatEvent(msg : ChatEventData ,ws : WebSocket){
    console.log("chat event occured", msg);
    const { roomId, message } = msg;
    console.log("The message is", message);
    console.log("the roomId is", roomId);

    const data ={
        eventType :'chat_event',
        message : message,
        messageSender : ws
    }
    
    BroadCastMessageInRoom(roomId,ws,data)
}