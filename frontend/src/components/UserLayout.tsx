import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExcalidrawComponent } from "../components/ExacliDraw";
import { CustomButton } from "../components/Button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useSocket } from "../strore/useSocket";
import Cookies from "js-cookie";
import { useExcaliData } from "../strore/useExcaliData";
import { useNavigate, useParams } from "react-router-dom";
import { Room } from "livekit-client";
import { useRef } from "react";
import useLiveKit from "../hooks/useLiveKit";
import { toast } from "sonner";
import { useRoomJoin } from "../strore/useRoomJoin";
import { ChatComponent } from "./Chat";
import { useNewMsg } from "../strore/useMsg";
import { useChatHistory } from "../strore/useChatHistory";
import Draggable from "react-draggable";

interface userLayoutProps {
  liveKitToken: string;
}

export default function UserLayout({ liveKitToken }: userLayoutProps) {
  const [hidepanel, setIsHidePanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "excalidraw" | "video" | "screen_share"
  >("video");
  const [roomId, setRoomId] = useState<string | null>(null);
  const Socket = useSocket((state) => state.socket);
  const setSocket = useSocket((state) => state.setSocket);
  const setExcalidrawData = useExcaliData((state) => state.setExcalidrawData);
  const setIsRoomJoined = useRoomJoin((state) => state.setIsRoomJoined);
  const setNewMsg = useNewMsg((state) => state.setNewMsg);
  const setChatHistory = useChatHistory((state) => state.setChatHistory);
  const { RoomId } = useParams();

  const roomRef = useRef<Room | null>(null);
  const socket = useRef<WebSocket | null>(null);

  const navigate = useNavigate();

  const { videoRef, audioRef, room, connection } = useLiveKit(
    liveKitToken,
    roomRef
  );

  roomRef.current = room;
  useEffect(() => {
    if (Socket || !connection) return;
    if (RoomId) {
      setRoomId(RoomId);
    }

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
      const parsedMessage = JSON.parse(message.data);
      const { msg, state, chat } = parsedMessage;
      if (chat) {
        setChatHistory(chat);
      }
      if (msg.eventType === "chat_event") {
        const { message } = msg;
        setNewMsg(message);
      }
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

      if (!msg) return;

      let { data } = msg;
      console.log("the data is 1", data);
      if (state) {
        console.log("why me call!!! 2");
        let currState = state === "switch_to_video" ? "video" : "excalidraw";
        if (state === "switch_to_screen_share") currState = "screen_share";
        data = currState;
      }
      if (
        data !== undefined &&
        (data === "video" || data === "excalidraw" || data === "screen_share")
      ) {
        console.log(3);
        const currentScreen = data;
        // currentScreen === "video"
        if (currentScreen === "video") setActiveScreen("video");
        else if (currentScreen === "excalidraw") setActiveScreen("excalidraw");
        else if (currentScreen === "screen_share") {
          console.log("mia khalifa");
          setActiveScreen("screen_share");
        }
      } else if (data) {
        const appState = data;
        const dummyApp = { ...appState, collaborators: [] };
        const dummyData = { appState: dummyApp, elements: data.elements };
        setExcalidrawData(dummyData);
      }
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
            hidepanel ? "w-full sm:w-[80%]" : "w-full"
          }`}
        >
          {activeScreen === "excalidraw" && <ExcalidrawComponent />}
          {activeScreen === "screen_share" && <div>Share Screen</div>}

          {/* Video */}
          <Draggable disabled={activeScreen === "video"}>
            <div
              className={`absolute ${
                activeScreen === "video"
                  ? "w-full h-full"
                  : "top-0 right-0 min-w-[250px] h-36 bg-background border-2 border-primary rounded-lg shadow-lg z-50"
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
