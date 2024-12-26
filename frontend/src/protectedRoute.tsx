import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./strore/useAuth";

const ProtectedRoute = () => {
    const isLoggedIn = useAuth((state) => state.isLoggedIn);
    
    return isLoggedIn ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;