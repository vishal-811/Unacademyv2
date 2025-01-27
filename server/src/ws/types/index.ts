import { RoleType } from "@prisma/client";

export interface RoomEventData {
  roomId: string;
}

export interface UserTokenData {
  userId: string; //user ID
  role: RoleType;
}

export interface ExcaliDrawEventData {
  roomId: string;
  excaliEvent: any;
}

export interface SwitchEvent extends RoomEventData {
  eventType: string;
}
