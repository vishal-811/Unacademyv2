import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExcalidrawComponent } from "../components/ExacliDraw";
import { CustomButton } from "../components/Button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useSocket } from "../strore/useSocket";
import Cookies from "js-cookie";
import { useExcaliData } from "../strore/useExcaliData";
import { useNavigate, useParams } from "react-router-dom";
import { useRef } from "react";
import { toast } from "sonner";
import { useRoomJoin } from "../strore/useRoomJoin";
import { ChatComponent } from "./Chat";
import { useNewMsg } from "../strore/useMsg";
import { useChatHistory } from "../strore/useChatHistory";
import Draggable from "react-draggable";
import useUserLiveKit from "../hooks/useUserLivekit";
import { GetSlides } from "./getSlides";

interface userLayoutProps {
  liveKitToken: string;
}

export default function UserLayout({ liveKitToken }: userLayoutProps) {
  const [hidepanel, setIsHidePanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "excalidraw" | "video" | "screen_share" | "slides"
  >("video");
  const [roomId, setRoomId] = useState<string | null>(null);
  const Socket = useSocket((state) => state.socket);
  const setSocket = useSocket((state) => state.setSocket);
  const setExcalidrawData = useExcaliData((state) => state.setExcalidrawData);
  const setIsRoomJoined = useRoomJoin((state) => state.setIsRoomJoined);
  const setNewMsg = useNewMsg((state) => state.setNewMsg);
  const setChatHistory = useChatHistory((state) => state.setChatHistory);
  const { RoomId } = useParams();

  const socket = useRef<WebSocket | null>(null);

  const navigate = useNavigate();

  const { videoRef, audioRef, screenShareRef, roomRef, connection } =
    useUserLiveKit(liveKitToken);

  useEffect(() => {
    if (Socket || !connection) return;

    if (RoomId) {
      setRoomId(RoomId);
    }

    const token_url = Cookies.get("token");

    let ws = socket.current;
    ws = new WebSocket(`https://unacademy-server.vishalsharma.xyz?token=${token_url}`);
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
      const parsedMessage = JSON.parse(message.data);
      const { msg, state, excaliData, chatData, prevChat } =
        parsedMessage.payload;

      if (
        msg === "wait for the admin to join the meeting" ||
        msg === "Admin join the meeting" ||
        msg === "You joined the meeting"
      ) {
        toast.info(msg);
      }

      if (msg === "Admin leave the meeting") {
        toast.warning(msg);
        setIsRoomJoined(false);
        navigate("/");
      }

      if (state) {
        switch (state) {
          case "switch_to_video":
            setActiveScreen("video");
            break;
          case "switch_to_excalidraw":
            setActiveScreen("excalidraw");
            break;
          case "switch_to_screen_share":
            setActiveScreen("screen_share");
            break;
          case "switch_to_slides":
            setActiveScreen("slides");
            break;
          default:
            console.log("error in switch event!");
        }
      }
      if (excaliData) {
        const appState = excaliData;
        const dummyApp = { ...appState, collaborators: [] };
        const dummyData = { appState: dummyApp, elements: excaliData.elements };
        setExcalidrawData(dummyData);
      }

      if (prevChat) setChatHistory(prevChat);

      if (chatData && chatData.eventType === "chat_event")
        setNewMsg(chatData.message);
    };

    return () => {
      ws.onclose = () => {
        ws.send(
          JSON.stringify({
            type: "leave_room",
            data: {
              roomId: roomId,
            },
          })
        );
      };
      setSocket(null);
      roomRef?.current?.disconnect();
    };
  }, [RoomId, liveKitToken, connection]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col space-y-4 relative">
      <div className="flex flex-col sm:flex-row h-[calc(100%-4rem)] space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Main screen */}
        <motion.div
          layout
          className={`border border-primary rounded-lg overflow-hidden relative ${
            hidepanel ? "w-full h-full sm:w-[80%]" : "w-full h-full"
          }`}
        >
          {activeScreen === "excalidraw" && <ExcalidrawComponent />}
          {activeScreen === "screen_share" && (
            <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {activeScreen === "slides" && <GetSlides />}

          {/* Video */}
          <Draggable
            disabled={activeScreen === "video"}
            position={activeScreen === "video" ? { x: 0, y: 0 } : undefined}
          >
            <div
              className={`absolute ${
                activeScreen === "video"
                  ? "w-full h-full top-0 left-0 object-cover overflow-hidden"
                  : "top-0 right-0 min-w-[250px] h-36 bg-background border-2 border-primary rounded-xl shadow-lg z-50"
              }`}
              style={{
                transform: activeScreen === "video" ? "none" : undefined,
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-xl"
              />
              <audio ref={audioRef} autoPlay muted />
            </div>
          </Draggable>
        </motion.div>

        {/* Chat */}
        {!hidepanel && <ChatComponent />}
      </div>

      <div className="absolute bottom-4 right-4">
        {hidepanel ? (
          <CustomButton onClick={() => setIsHidePanel(false)} variant="outline">
            <Maximize2 className="max-h-4  max-w-w-4" /> Show Chat
          </CustomButton>
        ) : (
          <CustomButton onClick={() => setIsHidePanel(true)} variant="outline">
            <Minimize2
              className=" 
            max-h-4 max-w-4"
            />{" "}
            Hide Chat
          </CustomButton>
        )}
      </div>
    </div>
  );
}
