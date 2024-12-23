import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { WebSocket } from "ws";
import { UserTokenData } from "../types";

dotenv.config();


export const extractAuthUser = (token: string, ws: WebSocket): UserTokenData | null => {
  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET || "") as UserTokenData;
    return decoded;
  } catch (error : any) {
    console.error("Failed to verify token:", error.message);
    return null;
  }
};
