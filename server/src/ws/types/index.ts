import { RoleType } from "@prisma/client";
import WebSocket from "ws";

export interface RoomEventData {
  roomId: string;
}

export interface UserTokenData {
  userId: string; //user ID
  role?: RoleType;
  isadmin? : boolean
}

export interface ExcaliDrawEventData {
  roomId: string;
  excaliEvent: any;
}

export interface SwitchEvent extends RoomEventData {
  eventType: string;
}

export interface ChatEventData{
  roomId : string,
  message : string
}

export interface ChatResponse{
  eventType :string,
  message : string,
  messageSender : WebSocket
}