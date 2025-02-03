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
  createLocalScreenTracks,
  createLocalVideoTrack,
  Room,
  Track,
  VideoPresets,
} from "livekit-client";
import { useRef } from "react";
import useLiveKit from "../hooks/useLiveKit";
import { toast } from "sonner";
import { ChatComponent } from "./Chat";
import { useNewMsg } from "../strore/useMsg";
import Draggable from "react-draggable";
import { Loader } from "./Loader";
import axios from "axios";

export default function AdminLayout() {
  const liveKitToken = localStorage.getItem("liveKitToken");
  if (!liveKitToken) return null;
  const [hidepanel, setIsHidePanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<
    "excalidraw" | "screenshare" | "video" | "slides"
  >("video");

  const Socket = useSocket((state) => state.socket);
  const setSocket = useSocket((state) => state.setSocket);
  const setExcalidrawData = useExcaliData((state) => state.setExcalidrawData);
  const setNewMsg = useNewMsg((state) => state.setNewMsg);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const { RoomId } = useParams<string>();

  const roomRef = useRef<Room | null>(null);
  const socket = useRef<WebSocket | null>(null);
  // const shareScreenRef = useRef<LocalTrack[] | null>(null);
  const shareScreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const shareScreenAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!RoomId) return;

  const { videoRef, audioRef, room, connection } = useLiveKit(
    liveKitToken,
    roomRef
  );

  async function handleShareScreen(room: Room | null) {
    if (!room) return;
    setActiveScreen("screenshare");
    await room.localParticipant.setScreenShareEnabled(true);

    const screenShareTrack = await createLocalScreenTracks({
      audio: true,
    });

    screenShareTrack.map(async (track) => {
      try {
        if (track.kind === Track.Kind.Video) {
          track.attach(shareScreenVideoRef.current!);
          await room.localParticipant.publishTrack(track);
        }
        if (track.kind === Track.Kind.Audio) {
          track.attach(shareScreenAudioRef.current!);
          await room.localParticipant.publishTrack(track);
        }
      } catch (error) {
        console.log("error in publishing the screenShareTrack to the client");
      }
    });
  }

  useEffect(() => {
    if (Socket || !connection || !RoomId) return;
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
      if (msg.eventType === "chat_event") {
        const { message } = msg;
        setNewMsg(message);
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
        toast.error("error in connecting to the livekit serrver");
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
  }, [RoomId, liveKitToken, connection]);

  const handleSendEvent = (type: string) => {
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
                ref={shareScreenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <audio ref={shareScreenAudioRef} autoPlay />
            </div>
          )}
          {activeScreen === "slides" && !uploaded ? (
            <div className="w-full h-full flex items-center justify-center">
              <UploadSlides RoomId={RoomId} />
            </div>
          ) : (
            activeScreen === "slides" && <div>Your slides are</div>
          )}

          {/* Video */}
          <Draggable disabled={activeScreen === "video"}>
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

const UploadSlides = ({ RoomId }: { RoomId: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<boolean>(false);

  async function handleUploadPdf(file: File) {
    if (!file || file.type !== "application/pdf") return;

    const formData = new FormData();
    formData.append("file", file);

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
        console.log("Pdf uploaded successfully");
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
