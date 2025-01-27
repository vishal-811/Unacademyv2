import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExcalidrawComponent } from "../components/ExacliDraw";
import { CustomButton } from "../components/Button";
import {
  Maximize2,
  Minimize2,
  Share,
  FileUp,
  Video,
  Mic,
  Edit3,
} from "lucide-react";
import { useSocket } from "../strore/useSocket";
import Cookies from "js-cookie";
import { useExcaliData } from "../strore/useExcaliData";
import { useParams } from "react-router-dom";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  Room,
  VideoPresets,
} from "livekit-client";
import { useRef } from "react";
import useLiveKit from "../hooks/useLiveKit";
import { toast } from "sonner";
import { ChatComponent } from "./Chat";

export default function AdminLayout() {
  const [hidepanel, setIsHidePanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "excalidraw" | "screenshare" | "video"
  >("video");

  const [roomId, setRoomId] = useState<string | null>(null);
  const Socket = useSocket((state) => state.socket);
  const setSocket = useSocket((state) => state.setSocket);
  const setExcalidrawData = useExcaliData((state) => state.setExcalidrawData);
  const liveKitToken = localStorage.getItem("liveKitToken");
  const { RoomId } = useParams();

  const roomRef = useRef<Room | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!liveKitToken) return null;

  const { room, connection } = useLiveKit(liveKitToken, roomRef);

  useEffect(() => {
    if (Socket || !connection || !RoomId) return;

    setRoomId(RoomId);
    const token_url = Cookies.get("token");

    let ws = socket.current;
    ws = new WebSocket(`ws://localhost:3000?token=${token_url}`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join_room",
          data: {
            roomId: RoomId,
          },
        })
      );
    };

    setSocket(ws);

    ws.onmessage = (message: any) => {
      const { msg } = JSON.parse(message.data);
      if(msg.eventType === 'chat_event'){
        console.log("the message is",msg.message)
        console.log("the sender is", msg.messageSender)
      }
      if (msg === "u joined the meeting sucessfully") {
        toast.success("You Joined the meeting!");
      }
      if (!message.data.message) return;
      setExcalidrawData(JSON.parse(message.data.msg));
    };

    (async () => {
      if (!liveKitToken || !room) return;

      try {
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);

        const videoTrack = await createLocalVideoTrack({
          facingMode: "user",
          resolution: VideoPresets.h720,
        });
        const audioTrack = await createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
        });

        if (videoRef.current) {
          videoTrack.attach(videoRef.current);
        }
        if (audioRef.current) {
          audioTrack.attach(audioRef.current);
        }

        await room.localParticipant.publishTrack(videoTrack);
        await room.localParticipant.publishTrack(audioTrack);
      } catch (error) {
        console.error("An error occurred during LiveKit setup:", error);
      }
    })();

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "leave_room",
            data: {
              roomId: roomId,
            },
          })
        );
        ws.close();
      }

      if (room) {
        room.localParticipant.setCameraEnabled(false);
        room.localParticipant.setMicrophoneEnabled(false);
        room.disconnect();
      }
      localStorage.removeItem("liveKitToken");
    };
  }, [RoomId, liveKitToken, connection]);

  const handleSendEvent = (type: string) => {
    if (!Socket) return;
    Socket?.send(
      JSON.stringify({
        type: "switch_event",
        data: {
          roomId: roomId,
          eventType: type,
        },
      })
    );
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col space-y-4 relative">
      <div className="flex flex-col sm:flex-row h-[calc(100%-4rem)] space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Main screen */}
        <motion.div
          layout={false}
          className={`border border-primary rounded-lg overflow-hidden relative ${
            hidepanel ? "w-[80%]" : "w-full"
          }`}
        >
          {activeScreen === "excalidraw" && <ExcalidrawComponent />}
          {activeScreen === "screenshare" && (
            <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
              Screen Share
            </div>
          )}
          {/* Video */}
          <div
            className={`${
              activeScreen === "video"
                ? "absolute w-full h-full"
                : "absolute top-16 right-0 min-w-[250px] h-36 bg-background border-2 border-primary rounded-lg overflow-hidden shadow-lg z-50 bg-opacity-100 object-cover"
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <audio ref={audioRef} autoPlay />
          </div>
        </motion.div>

        {/* Chat panel */}
        {!hidepanel && <ChatComponent />}
      </div>

      {/* Control panel */}
      <div className="flex flex-wrap items-center gap-2 mx-auto">
        <CustomButton
          onClick={() => setActiveScreen("screenshare")}
          variant="outline"
        >
          <Share className="mr-2 h-4 w-4" /> Share Screen
        </CustomButton>
        <CustomButton onClick={() => {}} variant="outline">
          <FileUp className="mr-2 h-4 w-4" /> Upload PDF
        </CustomButton>
        <CustomButton
          onClick={() => {
            setActiveScreen("video");
            handleSendEvent("switch_to_video");
          }}
          variant="outline"
        >
          <Video className="mr-2 h-4 w-4" /> Video
        </CustomButton>
        <CustomButton onClick={() => {}} variant="outline">
          <Mic className="mr-2 h-4 w-4" /> Audio
        </CustomButton>
        <CustomButton
          onClick={() => {
            setActiveScreen("excalidraw");
            handleSendEvent("switch_to_excalidraw");
          }}
          variant="outline"
        >
          <Edit3 className="mr-2 h-4 w-4" /> Whiteboard
        </CustomButton>
        {hidepanel ? (
          <CustomButton onClick={() => setIsHidePanel(false)} variant="outline">
            <Maximize2 className="mr-2 h-4 w-4" /> Show Chat
          </CustomButton>
        ) : (
          <CustomButton onClick={() => setIsHidePanel(true)} variant="outline">
            <Minimize2
              className="mr-2 
            h-4 w-4"
            />{" "}
            Hide Chat
          </CustomButton>
        )}
      </div>
    </div>
  );
}
