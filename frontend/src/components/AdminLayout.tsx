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
// import { useExcaliData } from "../strore/useExcaliData";
import { useParams } from "react-router-dom";
import {
  createLocalAudioTrack,
  createLocalScreenTracks,
  createLocalVideoTrack,
  Room,
  Track,
  VideoPresets,
} from "livekit-client";
import { useRef } from "react";
import { toast } from "sonner";
import { ChatComponent } from "./Chat";
import { useNewMsg } from "../strore/useMsg";
import Draggable from "react-draggable";
import { Loader } from "./Loader";
import axios from "axios";
import { useFileName } from "../strore/useFileName";
import useAdminLiveKit from "../hooks/useAdminLiveKit";
import { GetSlides } from "./getSlides";

export default function AdminLayout() {
  const liveKitToken = localStorage.getItem("liveKitToken");
  if (!liveKitToken) return null;
  const [hidepanel, setIsHidePanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "excalidraw" | "screenshare" | "video" | "slides"
  >("video");

  const Socket = useSocket((state) => state.socket);
  const setSocket = useSocket((state) => state.setSocket);
  // const setExcalidrawData = useExcaliData((state) => state.setExcalidrawData);
  const setNewMsg = useNewMsg((state) => state.setNewMsg);
  const [pdfUploaded, setPdfUploaded] = useState<boolean>(false);
  const { RoomId } = useParams<string>();

  const socket = useRef<WebSocket | null>(null);

  if (!RoomId) return;

  const { videoRef, screenShareRef, roomRef, connection } =
    useAdminLiveKit(liveKitToken);

  const room = roomRef.current;
  async function handleShareScreen(room: Room | null) {
    try {
      if (!room) return;

      setActiveScreen("screenshare");
      const screenShareTracks = await createLocalScreenTracks({
        audio: true,
      });

      await Promise.all(
        screenShareTracks.map(async (track) => {
          if (track.kind === Track.Kind.Video) {
            track.attach(screenShareRef.current!);
            await room.localParticipant.publishTrack(track);
          }
        })
      );

      await room.localParticipant.setScreenShareEnabled(true);
    } catch (error) {
      await room?.localParticipant.setScreenShareEnabled(false);
    }
  }
  useEffect(() => {
    if (Socket || !connection || !RoomId || !room) return;
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
      const parsedData = JSON.parse(message.data);
      const { chatData, msg } = parsedData.payload;
      if (chatData && chatData.eventType === "chat_event") {
        const  message  = chatData.message;
        setNewMsg(message);
      }
      if (msg === "u joined the meeting sucessfully") {
        toast.success("You Joined the meeting!");
      }
      // if (!message.data.message) return;
      // setExcalidrawData(JSON.parse(message.data.msg));
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

        await room.localParticipant.publishTrack(videoTrack);
        await room.localParticipant.publishTrack(audioTrack);
      } catch (error) {
        console.error(error);
        toast.error("error in connecting to the livekit server");
      }
    })();

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "leave_room",
            data: {
              roomId: RoomId,
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
      setSocket(null);
    };
  }, [RoomId, liveKitToken, connection, room]);

  const handleSendEvent = (type: string) => {
    console.log("Switch event occured", type)
    if (!Socket) return;
    Socket?.send(
      JSON.stringify({
        type: "switch_event",
        data: {
          roomId: RoomId,
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
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {activeScreen === "slides" && !pdfUploaded ? (
            <div className="w-full h-full flex items-center justify-center">
              <UploadSlides RoomId={RoomId} setPdfUploaded={setPdfUploaded} />
            </div>
          ) : (
            activeScreen === "slides" && (
              <div className="text-red-500 font-bold text-3xl w-full h-full object-cover">
                <GetSlides />
              </div>
            )
          )}

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
            </div>
          </Draggable>
        </motion.div>

        {/* Chat panel */}
        {!hidepanel && <ChatComponent />}
      </div>
      {/* Control panel */}
      <div className="flex flex-wrap items-center gap-2 mx-auto">
        <CustomButton
          onClick={() => {
            handleShareScreen(room);
            handleSendEvent("switch_to_screen_share");
          }}
          variant="outline"
        >
          <Share className="mr-2 h-4 w-4" /> Share Screen
        </CustomButton>
        <CustomButton
          onClick={() => {
            setActiveScreen("slides");
            handleSendEvent("switch_to_slides");
          }}
          variant="outline"
        >
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
            handleSendEvent("switch_to_excalidraw");
            setActiveScreen("excalidraw");
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

const UploadSlides = ({
  RoomId,
  setPdfUploaded,
}: {
  RoomId: string;
  setPdfUploaded: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<boolean>(false);
  const setFileName = useFileName((state) => state.setFileName);

  async function handleUploadPdf(file: File) {
    if (!file || file.type !== "application/pdf") return;

    const formData = new FormData();
    formData.append("file", file);

    const filename = file.name;
    setFileName(filename);

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:3000/api/v1/room/Upload-pdf/${RoomId}`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        setPdfUploaded(true);
      }
    } catch (error) {
      toast.error("something went wrong in uploading pdf");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <div className="flex flex-col space-y-4">
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700"
          >
            Upload PDF
          </label>
          <div className="relative">
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>
          {file && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={() => handleUploadPdf(file)}
              disabled={loading}
            >
              Upload
            </button>
          )}
        </div>
      </div>
      {loading && <Loader />}
    </>
  );
};
