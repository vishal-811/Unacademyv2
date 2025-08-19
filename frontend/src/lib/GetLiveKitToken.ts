import axios, { AxiosResponse } from "axios";

export interface liveKitTokenResponse {
  data: {
    liveKitToken: string;
  };
}

export async function GenerateLiveKitToken(
  roomId: string
): Promise<String | null> {
  try {
    const res: AxiosResponse<liveKitTokenResponse> = await axios.post(
      `https://unacademy-server.vishalsharma.xyz/api/v1/room/generateToken`,
      {
        roomId: roomId,
      },
      {
        withCredentials: true,
      }
    );
    const liveKitToken = res.data.data.liveKitToken;
    if (!liveKitToken) throw new Error("LiveKit token not found");
    return liveKitToken;
  } catch (error) {
    return null;
  }
}