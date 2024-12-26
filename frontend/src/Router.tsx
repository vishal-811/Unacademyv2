import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/Signin";
import ProtectedRoute from "./protectedRoute";
import Layout from "./pages/Layout";
import { CreateRoom } from "./pages/CreateRoom";

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
    element: <SigninPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/layout",
        element: <Layout />,
      },
      {
        path: "/createRoom",
        element: <CreateRoom />,
      },
    ],
  },
]);

export default router;
