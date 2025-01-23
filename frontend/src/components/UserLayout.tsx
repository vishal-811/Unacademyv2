import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExcalidrawComponent } from "../components/ExacliDraw";
import { CustomButton } from "../components/Button";
import { Maximize2 } from "lucide-react";
import { useSocket } from "../strore/useSocket";
import Cookies from "js-cookie";
import { useExcaliData } from "../strore/useExcaliData";
import { useParams } from "react-router-dom";

export default function UserLayout() {
  const [hidepanel, setIsHidePanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<"excalidraw" | "video">(
    "video"
  );
  const [roomId, setRoomId] = useState<string | null>(null);
  const setSocket = useSocket((state) => state.setSocket);
  const setExcalidrawData = useExcaliData((state) => state.setExcalidrawData);

  const { RoomId } = useParams();
  console.log("The roomId from the", RoomId);
  
  useEffect(() => {
    if(RoomId){
      setRoomId(RoomId);
    }
  }, [RoomId]);

  useEffect(() => {
    const token_url = Cookies.get("token");
    
    const socket = new WebSocket(`ws://localhost:3000?token=${token_url}`);
     
    console.log("the user connected to the Socket")
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "join_room",
          data: {
            roomId: roomId,
          },
        })
      );
    };

    setSocket(socket);

    socket.onmessage = (message: any) => {
      console.log("the message we got is", message);
      const parsedMessage = JSON.parse(message.data);
      const { msg, state } = parsedMessage;
      if (!msg) return;
      let { data } = msg;
      
      if(state){
       let currState = state === "switch_to_video" ? "video" :"excalidraw"
       data = currState;
      } 
      if(data !== undefined && (data === "video" || data === "excalidraw")) {
        const currentScreen = data;
        currentScreen === "video"
          ? setActiveScreen("video")
          : setActiveScreen("excalidraw");
      } else if (data) {
        const appState = data;
        const dummyApp = { ...appState, collaborators: [] };
        const dummyData = { appState: dummyApp, elements: data.elements };
        console.log("the dummy data is", dummyData);
        setExcalidrawData(dummyData);
      }
    };

    socket.onclose = () => {
      socket.send(
        JSON.stringify({
          type: "leave_room",
          data: {
            roomId: roomId,
          },
        })
      );
    };
  }, [roomId]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] border-2 border-solid border-zinc-100 p-2 flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row h-[calc(100%-4rem)] space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Main screen */}
        <motion.div
          layout
          className={`border border-primary rounded-lg overflow-hidden ${
            hidepanel ? "w-full sm:w-[80%]" : "w-full"
          }`}
        >
          {activeScreen === "video" && (
            <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
              Video Call
            </div>
          )}
          {activeScreen === "excalidraw" && <ExcalidrawComponent />}
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

      {/* Small screen video overlay */}
      {activeScreen !== "video" && (
        <div className="fixed top-14 right-2  min-w-[250px] h-36 bg-background border-2 border-primary rounded-lg overflow-hidden shadow-lg">
          <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
            Video Preview
          </div>
        </div>
      )}
    </div>
  );
}
