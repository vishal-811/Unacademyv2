import WebSocket from "ws";
import { ChatEventData } from "../types";
import { BroadCastMessageInRoom } from "../lib/utils";
import { Client } from "../..";



export async function handleChatEvent(msg : ChatEventData ,ws : WebSocket){
    const { roomId, message } = msg;
    const data ={
        eventType :'chat_event',
        message : message,
        messageSender : ws
    }
     // storing chat in a redis db 
    const redisDbRoomSize = await  Client.lLen(roomId);
    
    if(redisDbRoomSize >= 50){
       await  Client.LTRIM(roomId,0,50-1); // delete the last message.
    }
      await Client.lPush(roomId, message);
    BroadCastMessageInRoom(roomId,ws,data);
}