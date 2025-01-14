import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/Signin";
import ProtectedRoute from "./protectedRoute";
import CreateRoom from "./pages/CreateRoom";
import SignupPage from "./pages/Signup";
import JoinRoom from "./pages/JoinRoom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signin",
    element: <SigninPage />,
  },
  {
    path: "/signup",
    element: <SignupPage/>,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/room/:RoomId",
        element: <JoinRoom/>,
      },
      {
        path: "/createRoom",
        element: <CreateRoom />,
      },
    ],
  },
]);

export default router;
