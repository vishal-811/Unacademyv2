import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCopy, FiShare2 } from "react-icons/fi";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useExcaliRoomId } from "../strore/useExcaliRoomId";
import { useLiveKitToken } from "../strore/useLiveKitToken";
import { toast } from "sonner"

interface liveKitTokenResponse {
  data: {
    roomId: string;
    liveKitToken: string;
  };
}

export default function CreateRoom() {
  const [roomName, setRoomName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [roomLink, setRoomLink] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  const navigate = useNavigate();

  const setExcaliRoomId = useExcaliRoomId((state) => state.setExcaliRoomId);
  const setLiveKitToken = useLiveKitToken((state) => state.setLiveKitToken);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const res: AxiosResponse<liveKitTokenResponse> = await axios.post(
        "http://localhost:3000/api/v1/room/createRoom",
        {
          roomname: roomName,
          description: description,
        },
        {
          withCredentials: true,
        }
      );
      if (res.status === 201) {
        const roomId = res.data.data.roomId;
        const liveKitToken = res.data.data.liveKitToken;
        setRoomLink(`${roomId}`);
        setRoomId(roomId);
        localStorage.setItem("liveKitToken", liveKitToken);
        setExcaliRoomId(roomId);
      }
    } catch (error) {
      console.log("error in creating the room");
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${roomLink}`);
    toast.success("Link copied sucessfully");
  };

  const shareLink = () => {
    // Pending the share link via  various platforms
    alert(`Share this link: http://localhost:5173/room${roomLink}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-300">
          Create Online Class Room
        </h1>
        <AnimatePresence mode="wait">
          {!roomLink ? (
            <motion.form
              key="create-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleCreateRoom}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="roomName"
                  className="block text-sm font-medium text-blue-300 mb-1"
                >
                  Room Name
                </label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  placeholder="Enter room name"
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-blue-300 mb-1"
                >
                  Room Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter room description"
                  rows={4}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-300 ${
                  isCreating
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Room...
                  </span>
                ) : (
                  "Create Room"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="room-created"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 p-6 rounded-lg shadow-xl"
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                Room Created Successfully!
              </h2>
              <p className="mb-2 text-blue-100">
                Share this link with your students:
              </p>
              <motion.div
                className="bg-gray-700 p-3 rounded-md flex justify-between items-center mb-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="font-mono text-lg text-blue-300 truncate">
                  {roomLink}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={copyLink}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FiCopy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={shareLink}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FiShare2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
              <button
                onClick={() => navigate(`/room/${roomId}`)}
                className="w-full py-2 px-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-300"
              >
                Join this room
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
