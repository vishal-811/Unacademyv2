import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import { useSocket } from "../strore/useSocket"
import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { useNewMsg } from "../strore/useMsg"
import { useChatHistory } from "../strore/useChatHistory"

export const ChatComponent = () => {
  const [msg, setMsg] = useState<string>("")
  const [allMsg, setAllMsg] = useState<string[]>([])
  const newMsg = useNewMsg((state) => state.newMsg)
  const Socket = useSocket((state) => state.socket)
  const chatHistory = useChatHistory((state) => state.chatHistory)
  const { RoomId } = useParams<string>()
  const chatHistoryRef = useRef<HTMLDivElement>(null)

  function handleMessage(msg: string | null) {
    if (!Socket || !msg || !RoomId) {
      toast.info("Something went wrong")
      if (msg) setMsg("")
      return
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
          }),
        )
      } else {
        throw new Error("WebSocket connection is closed")
      }
    } catch (error) {
      toast.warning("Error in sending message")
    } finally {
      setMsg("")
    }
  }

  useEffect(() => {
    if (!newMsg) return
    setAllMsg((prevMsg) => [...prevMsg, newMsg])
  }, [newMsg])

  useEffect(() => {
    if (!chatHistory) return
    setAllMsg((prevMsg) => [...prevMsg, ...chatHistory])
  }, [chatHistory])

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
    }
  }, [allMsg])

  return (
    <div className="relative bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl shadow-lg h-full flex flex-col">
      <AnimatePresence>
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-lg h-full flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <h2 className="text-xl font-bold text-teal-800 py-4 px-6 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-t-xl sticky top-0 z-10 shadow-sm">
            Chat Messages
          </h2>

          {/* Chat History */}
          <div ref={chatHistoryRef} className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar scroll-smooth">
            {allMsg.map((chat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-[80%] break-words"
              >
                <div className="p-3 rounded-lg bg-teal-50 text-teal-800 shadow-sm">{chat}</div>
              </motion.div>
            ))}
          </div>

          {/* Chat Input Section */}
          <div className="w-full flex items-center space-x-3 p-4 bg-white border-t border-teal-100 rounded-b-xl">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleMessage(msg)}
              placeholder="Type a message..."
              type="text"
              className="flex-1 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 text-teal-800 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
            />
            <button
              onClick={() => handleMessage(msg)}
              className="p-3 rounded-full bg-teal-500 hover:bg-teal-600 text-white shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

