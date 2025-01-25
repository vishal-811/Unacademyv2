import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
// import { MediaController } from "./MediaController";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  Room,
  Track,
  VideoPresets,
} from "livekit-client";
import { JoinLiveKitServer } from "../lib/JoinLiveKitRoom";
import { useLiveKitToken } from "../strore/useLiveKitToken";
import { useRef } from "react";

export default function AdminLayout() {
  const [hidepanel, setIsHidePanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "excalidraw" | "screenshare" | "video"
  >("video");

  const [roomId, setRoomId] = useState<string | null>(null);
  const socket = useSocket((state) => state.socket);
  const setSocket = useSocket((state) => state.setSocket);
  const setExcalidrawData = useExcaliData((state) => state.setExcalidrawData);
  const liveKitToken = useLiveKitToken((state) => state.liveKitToken);

  const { RoomId } = useParams();

  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!RoomId) return;
    setRoomId(RoomId);


    const token_url = Cookies.get("token");

    const socket = new WebSocket(`ws://localhost:3000?token=${token_url}`);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "join_room",
          data: {
            roomId: RoomId,
          },
        })
      );
    };

    setSocket(socket);

    socket.onmessage = (message: any) => {
      if (!message.data.message) return;
      setExcalidrawData(JSON.parse(message.data.msg));
    };

    (async () => {
      if (!liveKitToken) return;

      try {
        const room = await JoinLiveKitServer(liveKitToken, roomRef);
        console.log("The room of livekit is",room);
        roomRef.current = room;

        if (!room) {
          return;
        }

        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);

        const videoTrack = await createLocalVideoTrack({ facingMode: "user",  resolution: VideoPresets.h720 });
        const audioTrack = await createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
        });
       
        videoTrack.attach(videoRef.current!);
        audioTrack.attach(audioRef.current!);

        await room.localParticipant.publishTrack(videoTrack);
        await room.localParticipant.publishTrack(audioTrack);
      } catch (error) {
        console.error("An error occurred during LiveKit setup:", error);
      }
    })();

    return () => {
      socket.close();

      if (roomRef.current) {
        roomRef.current.localParticipant.setCameraEnabled(false);
        roomRef.current.localParticipant.setMicrophoneEnabled(false);
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [RoomId, liveKitToken]);

  const handleSendEvent = (type: string) => {
    if (!socket) return;
    socket?.send(
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
    <div className="w-full h-[calc(100vh-4rem)] border-2 border-solid border-zinc-100 p-2 flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row h-[calc(100%-4rem)] space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Main screen */}
        <motion.div
          layout={false}
          className={`border border-primary rounded-lg overflow-hidden ${
            hidepanel ? "w-full sm:w-[80%]" : "w-full"
          }`}
        >
          {activeScreen === "excalidraw" && <ExcalidrawComponent />}
          {activeScreen === "screenshare" && (
            <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
              Screen Share
            </div>
          )}
          {activeScreen === "video" && (
            <div className="w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                className="w-full h-full"
              />
              <audio ref={audioRef} autoPlay />
            </div>
          )}
        </motion.div>

        {/* Chat panel */}
        <AnimatePresence>
          {!hidepanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "20%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-2 border-primary rounded-lg relative h-full min-w-[250px]"
            >
              <div className="p-4 h-full overflow-y-auto">
                {/* Chat content goes here */}
                <h2 className="text-lg font-semibold mb-4">Chat</h2>
                {/*  chat component */}
              </div>
              <CustomButton
                variant="outline"
                size="icon"
                className="absolute bottom-4 right-4"
                onClick={() => setIsHidePanel(!hidepanel)}
              >
                <Maximize2 className="h-4 w-4" />
              </CustomButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control panel */}
      <div className="flex flex-wrap justify-center gap-2">
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
        {hidepanel && (
          <CustomButton onClick={() => setIsHidePanel(false)} variant="outline">
            <Minimize2 className="mr-2 h-4 w-4" /> Show Chat
          </CustomButton>
        )}
      </div>

      {/* Small screen video overlay */}
      {activeScreen !== "video" && (
        <div className="fixed top-14 right-2  min-w-[250px] h-36 bg-background border-2 border-primary rounded-lg overflow-hidden shadow-lg">
          <div className="w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full"
            />
            <audio ref={audioRef} autoPlay />
          </div>
        </div>
      )}
    </div>
  );
}
