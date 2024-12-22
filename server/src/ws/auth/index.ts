import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { WebSocket } from "ws";

dotenv.config();

export const extractAuthUser = (token: string, ws: WebSocket) => {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET || "");
    return decoded;
}