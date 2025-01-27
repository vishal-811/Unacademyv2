import { RoleType } from "@prisma/client";
import { AccessToken } from "livekit-server-sdk";

export default async function GenerateLiveKitToken(
  roomName: string,
  userId: string,
  role: RoleType
) {
  try {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: userId,
        ttl: "10m",
      }
    );
    if (RoleType.instructor === role) {
      at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, roomAdmin: true });
    } else if (RoleType.student === role) {
      at.addGrant({ roomJoin: true, room: roomName, canPublish: false, canSubscribe : true });
    }
    const token = await at.toJwt();
    return token;
  } catch (error) {
    console.log("error in generating the token");
    return null;
  }
}
