import { useState } from "react";
import { motion } from "framer-motion";
import { Book, Users, Calendar, User, Menu, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useRole } from "../strore/useRole";
import { useAuth } from "../strore/useAuth";
import { useIsJoinRoomClicked, useRoomJoin } from "../strore/useRoomJoin";
import { useSocket } from "../strore/useSocket";

const navItems = [
  { name: "Courses", href: "/courses", icon: Book },
  { name: "Teachers", href: "/teachers", icon: Users },
  { name: "Schedule", href: "/schedule", icon: Calendar },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const userRole = useRole((state) => state.role);
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const isRoomJoined = useRoomJoin((state) => state.isRoomJoined);
  const SetisRoomJoinButtonClick = useIsJoinRoomClicked(
    (state) => state.setIsJoinRoomClicked
  );
  const setIsRoomJoined = useRoomJoin((state) => state.setIsRoomJoined);
  const socket = useSocket((state) => state.socket);
  const setSocket = useSocket((state) => state.setSocket);
  const { RoomId } = useParams();
  const navigate = useNavigate();

  const renderButton = () => {
    if (!isLoggedIn) {
      return (
        <button
          onClick={() => navigate("/signin")}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
        >
          <User className="h-4 w-5" />
          Login
        </button>
      );
    }

    if (userRole === "student") {
      return isRoomJoined ? (
        <button
          onClick={() => {
            socket?.send(
              JSON.stringify({
                type: "leave_room",
                data: {
                  roomId: RoomId,
                },
              })
            );
            socket?.close();
            setSocket(null);
            setIsRoomJoined(false);
            navigate("/")
          }}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
        >
          Leave Room
        </button>
      ) : (
        <button
          onClick={() => SetisRoomJoinButtonClick(true)}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
        >
          Join Room
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate("/createroom")}
        className={`flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
          isRoomJoined
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        } transition-colors duration-300`}
      >
        {isRoomJoined ? "Leave Room" : "Create Room"}
      </button>
    );
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">LearnTrack</span>
          </a>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden md:block">{renderButton()}</div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-600 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`md:hidden ${isOpen ? "block" : "hidden"}`}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -50 }}
        transition={{ duration: 0.3 }}
        exit={{ opacity: 0, y: -50 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-b-lg">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.name}
            </a>
          ))}
          <button
            onClick={() => navigate("/signin")}
            className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            <User className="w-5 h-5 mr-2" />
            Login
          </button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
