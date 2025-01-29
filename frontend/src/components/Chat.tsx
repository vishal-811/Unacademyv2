import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { useSocket } from "../strore/useSocket";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useNewMsg } from "../strore/useMsg";
import { useChatHistory } from "../strore/useChatHistory";

export const ChatComponent = () => {
  const [msg, setMsg] = useState<string>("");
  const [allMsg, setAllMsg] = useState<string[]>([]);
  const newMsg = useNewMsg((state) => state.newMsg);
  const Socket = useSocket((state) => state.socket);
  const chatHistory = useChatHistory((state) => state.chatHistory);
  const { RoomId } = useParams<string>();

  function handleMessage(msg: string | null) {
    if (!Socket || !msg || !RoomId) {
      toast.info("something went wrong");
      if (msg) setMsg("");
      return;
    }
    try {
      if (Socket?.readyState === WebSocket.OPEN) {
        Socket?.send(
          JSON.stringify({
            type: "chat_event",
            data: {
              roomId: RoomId,
              message: msg,
            },
          })
        );
      } else {
        throw new Error("ws connection is closed");
      }
    } catch (error) {
      toast.warning("error in sending message");
    } finally {
      setMsg("");
    }
  }

  useEffect(() => {
    if (!newMsg) return;
    setAllMsg((prevMsg) => [...prevMsg, newMsg]);
  }, [newMsg]);

  useEffect(() => {
    if (!chatHistory) return;
    setAllMsg((prevMsg) => [...prevMsg, ...chatHistory]); //functional updates are safer.
  }, [chatHistory]);

  useEffect(() => {
    const chatHistoryDiv = document.querySelector('.flex-1');
    chatHistoryDiv!.scrollTop = chatHistoryDiv!.scrollHeight;
  },[allMsg])
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg h-full flex flex-col">
    <AnimatePresence>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "25%", opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative min-w-[300px] bg-white border border-gray-200 rounded-xl shadow-lg h-full flex flex-col"
      >
        {/* Chat Header */}
        <h2
          className="text-xl font-semibold text-gray-800 backdrop-blur-3xl 
          py-2 px-4 border-b border-slate-100 rounded-tl-xl rounded-tr-xl bg-white sticky top-0 z-10"
        >
          Chat Messages
        </h2>
  
        {/* Chat History */}
        <div className="flex-1 overflow-auto p-4 space-y-2 hide-scrollbar scroll-smooth">
          {allMsg &&
            allMsg.map((chat, index) => (
              <div key={index} className="ps-2 pe-2 pb-1">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-800 shadow">
                  {chat}
                </div>
              </div>
            ))}
        </div>
  
        {/* Chat Input Section */}
        <div className="w-full flex items-center space-x-3 p-4 bg-gray-50 border-t border-gray-200">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type a message..."
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => handleMessage(msg)}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform transform hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
  
  );
};
