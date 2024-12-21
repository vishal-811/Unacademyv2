import WebSocket, { WebSocketServer } from "ws"
import prisma from "../lib";

const userRooms = new Map<string,WebSocket[]>(); //<RoomId,[user1,user2...]>

interface RoomEventData{
   roomId : string,
   role : string
}

function handleWebsocketCloseEvent(ws : WebSocket){

}

async function handleJoinRoom(data:RoomEventData, ws:WebSocket){
    const { roomId, role } = data;
    const isRoomExist = await prisma.room.findFirst({
        where:{
            id : roomId
        }
    })
    if(!isRoomExist){
        ws.send(JSON.stringify({msg :"Wrong Room Id"}));
        return;
    }

    const admin = role ==='instructor';
    if(!userRooms.has(roomId) && !admin){
       ws.send(JSON.stringify({msg :"No room exist with this roomId"}));
       return;
    }
    else if(!userRooms.has(roomId) && admin){
        userRooms.set(roomId,[ws]);
    }
    else{
        const users = userRooms.get(roomId);
        users?.push(ws);
        if(users){
            userRooms.set(roomId,users);
        }
    }
}

function handleLeaveRoom(data:RoomEventData,ws:WebSocket){
   const { roomId, role } = data;

   const room = userRooms.get(roomId);
   if(!room){
     ws.send(JSON.stringify({msg :"No room exist with this room Id"}));
     return;
   }
   const admin = role === 'instructor';
   if(admin){
     ws.send(JSON.stringify({msg :"Admin leave the meeting"}));
     userRooms.delete(roomId);
   }
   else{
    room.filter((user)=>{
        return user!=ws;
    })
    ws.send(JSON.stringify({msg :"You leave the meeting"}));
    return;
   }
}

export function handleWebsocketMessageEvent(message : string, ws :WebSocket){
    const parsedData = JSON.parse(message);
    const {type , data } = parsedData;
    console.log(type, data);
    
    switch(type){
        case 'join_room':{
            handleJoinRoom(data,ws)
            break;
        }
        case 'leave_room':{
            handleLeaveRoom(data,ws)
            break;
        }
    }
}

// wss.on('connection',(ws:WebSocket,req:Request)=>{
    // const cookies = req.headers;
    // const cookieString = cookies['set-cookie'] as string[];
    // if(!cookieString || !cookieString.length){
    //     ws.send("unauthorized to perform this action");
    //     return;
    // }
    // const fullCookieStr = cookieString[0];
    // const cookieMainpart = fullCookieStr.split(";")[0].split('connect.sid=')[1];
    // let decodedSession = decodeURIComponent(cookieMainpart);
    // decodedSession = decodedSession.split('s:')[1];
    // console.log("The parsed cookie looks like", decodedSession);
    // ws.on('error',(error)=>{
    //     console.log(error)
    // })

//     console.log("the session in ws", req.headers);
//     ws.on('message',(message : string,ws : WebSocket)=>{
//         console.log("the session in ws", req.headers);
//        handleWebsocketMessageEvent(message,ws);
//     })
//     ws.on('close',(ws : WebSocket)=>handleWebsocketCloseEvent(ws))
// })

// server.listen(8080,()=>{
//     console.log("Ws is listening on port 8080");
// })