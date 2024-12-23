import WebSocket from "ws"
import { UserTokenData } from "./types";
import { handleJoinRoom, handleLeaveRoom } from "./room/RoomManager";
import { handleExcaliDrawEvent } from "./excalidraw/ExcaliDrawEvents";


export function handleWebsocketCloseEvent(ws: WebSocket){
   
}

export function handleWebsocketMessageEvent(message : string, ws :WebSocket, userToken: UserTokenData){
    const parsedData = JSON.parse(message);
    const {type , data } = parsedData;
    const {userId , isAdmin} = userToken
    switch(type){
        case 'join_room':{
            handleJoinRoom(data,ws,userToken)
            break;
        }
        case 'leave_room':{
            handleLeaveRoom(data,ws,isAdmin)
            break;
        }
        case 'excali_draw_event':{
            handleExcaliDrawEvent(data,ws);
        }
    }
}
