import { RoomEventData, UserTokenData } from "../types";
import prisma from "../../lib";
import WebSocket from "ws";
import { boolean } from "zod";


enum RoomStatus {
  Waiting = "waiting",
  Active = "active",
}


interface RoomDetails{
  status : RoomStatus,
  users : WebSocket[]
}

export const roomsInfo = new Map<string,RoomDetails>(); //<RoomId,[user1,user2...]>

export async function handleJoinRoom(
  data: RoomEventData,
  ws: WebSocket,
  userToken: UserTokenData
) {
  if (!data) {
    ws.send(JSON.stringify({ msg: "Please provide a room Id" }));
    return;
  }
  const { roomId } = data;

  const isRoomExist = await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
  if (!isRoomExist) {
    ws.send(JSON.stringify({ msg: "Wrong Room Id" }));
    return;
  }

  const { userId, isAdmin } = userToken;
  console.log("is the user is admin or not", isAdmin);
  const isUserExist = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    ws.send(JSON.stringify({ msg: "No user exist with this userId" }));
    return;
  }
  const room = roomsInfo.get(roomId);

  if(!room && !isAdmin){
    roomsInfo.set(roomId,{status :RoomStatus.Waiting, users :[]});
  }

  if(!room && isAdmin){
    roomsInfo.set(roomId,{status :RoomStatus.Active, users :[]});
    
    const room = roomsInfo.get(roomId)?.users;
   
      room?.forEach((user) => {
        user.send(JSON.stringify({ msg :"Room join"}));
      })
    
  }

  if (room?.status === 'waiting') {
    room.users.push(ws);
    ws.send(JSON.stringify({ msg: "wait for the admin to join the meeting" }));
    return;
  } 
    const users = roomsInfo.get(roomId)?.users;
    users?.push(ws);
    ws.send(JSON.stringify({ msg: "Joined the room Successfully" }));
}

export function handleLeaveRoom(
  data: RoomEventData,
  ws: WebSocket,
  isAdmin : boolean
) {
  const { roomId } = data;

  let room = roomsInfo.get(roomId)?.users;
  if (!room) {
    ws.send(JSON.stringify({ msg: "No room exist with this room Id" }));
    return;
  }

  if (isAdmin) {
    ws.send(JSON.stringify({ msg: "you leave the meeting" }));
    BroadCastMessage(roomId,ws,"Admin leave the meeting")
    return roomsInfo.delete(roomId);
  }
    room = room.filter((user : WebSocket) => {
      return user != ws;
    });
    ws.send(JSON.stringify({ msg: "You leave the meeting" }));
    return;
  }

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

  room.forEach((user : WebSocket) => {
    if (user.OPEN && user != ws) {  //don't send the message to the admin also
      user.send(JSON.stringify({ msg: messageData }));
    }
  });
}
