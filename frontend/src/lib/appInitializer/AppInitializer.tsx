import { useEffect } from "react";
import { useAuth } from "../../strore/useAuth";

const AppInitializer = () => {
  const login = useAuth((state) => state.login);
  const isLoggedin = useAuth((state) => state.isLoggedIn);

  useEffect(() => {
    login();

    if (!isLoggedin) {
      localStorage.clear();
    }
  }, [login, isLoggedin]);

  return null;
};

export default AppInitializer;
