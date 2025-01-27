import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { useSocket } from "../strore/useSocket";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export const ChatComponent = () => {
  const [msg, setMsg] = useState<string>("");

  const Socket = useSocket((state) => state.socket);
  const { RoomId } = useParams<string>();

  if (!Socket) {
    return; // You can add an error fallback or toast notification here.
  }

  function handleMessage(msg: string | null) {
    if (!msg || !RoomId) {
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

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <AnimatePresence>
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "25%", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative h-full min-w-[300px] bg-white border border-gray-200 rounded-xl shadow-lg"
        >
          {/* Chat History */}
          <div className="p-4 h-[calc(100%-70px)] overflow-y-auto hide-scrollbar">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Chat Messages
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-800 shadow">
                User: Hello!
              </div>
              <div className="p-3 rounded-lg bg-gray-100 text-gray-800 shadow">
                You: Hi there!
              </div>
              {msg && (
                <div className="p-3 rounded-lg bg-gray-200 text-gray-700 shadow">
                  You: {msg}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 w-full rounded-xl flex items-center space-x-3 p-4 bg-gray-50 border-t border-gray-200">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          type="text"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={() => handleMessage(msg)}
          className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
