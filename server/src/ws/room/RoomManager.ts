import { RoomEventData, UserTokenData } from "../types";
import prisma from "../../lib";
import WebSocket from "ws";
import { RoleType } from "@prisma/client";
import { BroadCastMessage } from "../lib/utils";
import { Client } from "../..";

enum RoomStatus {
  Waiting = "waiting",
  Active = "active",
}

export enum RoomState {
  Video = "switch_to_video",
  ExcaliDraw = "switch_to_excalidraw",
  ScreenShare = "switch_to_screen_share",
  slides = "switch_to_slides",
}

interface RoomDetails {
  status: RoomStatus;
  users: WebSocket[];
  state: RoomState;
}

export const roomsInfo = new Map<string, RoomDetails>(); //<RoomId,[user1,user2...]>

export async function handleJoinRoom(
  data: RoomEventData,
  ws: WebSocket,
  userToken: UserTokenData
) {
  try {
    const userId = userToken.userId;
    if (!userId) ws.send(JSON.stringify({ msg: "Please provide the userId" }));
    const userExist = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!userExist) {
      ws.send(JSON.stringify({ msg: "No user exist with this user Id" }));
      return;
    }
    const role = userExist.role;
    const { roomId } = data;
    if (!roomId) {
      ws.send(JSON.stringify({ msg: "Please provide a room id" }));
      return;
    }

    const isRoomExist = await prisma.room.findFirst({
      where: {
        id: roomId,
      },
    });

    if (!isRoomExist) {
      ws.send(JSON.stringify({ msg: "No room exist with this roomId" }));
      return;
    }

    let room = roomsInfo.get(roomId);

    // Get the chat from the redis db.
    const chatHistory = await Client.LRANGE(roomId, 0, -1);

    if (!room) {
      room = {
        status:
          role === RoleType.instructor ? RoomStatus.Active : RoomStatus.Waiting,
        users: [],
        state: RoomState.Video,
      };
      roomsInfo.set(roomId, room);
    }
    if (
      room &&
      room.status === RoomStatus.Waiting &&
      role !== RoleType.instructor
    ) {
      room.users = [...room.users, ws];
      ws.send(
        JSON.stringify({
          msg: "wait for the admin to join the meeting",
          state: room.state,
          chat: chatHistory,
        })
      );
      return;
    }

    if (room && role === RoleType.instructor) {
      room.status = RoomStatus.Active;
      room.users = [...room.users, ws];
      room.users.forEach((user) => {
        if (user !== ws) {
          user.send(
            JSON.stringify({ msg: "Admin join the meeting", chat: chatHistory })
          );
        }
      });

      roomsInfo.set(roomId, room);
      ws.send(JSON.stringify({ msg: "u joined the meeting sucessfully" }));
      return;
    }

    if (room) {
      room.users = [...room.users, ws];

      ws.send(
        JSON.stringify({
          msg: "You joined the meeting",
          state: room.state,
          chat: chatHistory,
        })
      );
    }
  } catch (error) {
    ws.send(JSON.stringify({ msg: "Something went wrong, ws" }));
  }
}

export function handleLeaveRoom(
  data: RoomEventData,
  ws: WebSocket,
  role: RoleType
) {
   console.log("THe role of the user when leave the meeting ", role);
  try {
    const { roomId } = data;
    let room = roomsInfo.get(roomId)?.users;
    if (!room) {
      ws.send(JSON.stringify({ msg: "No room exist with this room Id" }));
      return;
    }

    if (role === RoleType.instructor) {
      BroadCastMessage(roomId, ws, "Admin leave the meeting");
      ws.send(JSON.stringify({ msg: "you leave the meeting" }));
      return roomsInfo.delete(roomId);
    }
    room = room.filter((user: WebSocket) => {
      return user != ws;
    });
    ws.send(JSON.stringify({ msg: "You leave the meeting" }));
    return;
  } catch (error) {
    ws.send(JSON.stringify({ msg: "Something went wrong, ws" }));
  }
}
