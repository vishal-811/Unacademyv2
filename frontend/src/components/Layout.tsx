import AdminLayout from "./AdminLayout";
import Navbar from "./Navbar";
import UserLayout from "./UserLayout";
import { RoleType, useRole } from "../strore/useRole";
import { GenerateLiveKitToken } from "../lib/GetLiveKitToken";
import { useEffect, useState } from "react";

type LayoutProps = {
  roomId: string;
};

export default function Layout({ roomId }: LayoutProps) {
  const role = useRole((state) => state.role);
  const [liveKitToken, setLiveKitToken] = useState<String>("");
  useEffect(() => {
    if (role === RoleType.student) {
      (async () => {
        const token = await GenerateLiveKitToken(roomId);
        if (!token) return;
        setLiveKitToken(token);
      })();
    }
  }, []);

  return (
    <>
      <Navbar />
      {role === RoleType.instructor ? (
        <AdminLayout />
      ) : (
        liveKitToken && <UserLayout liveKitToken={liveKitToken.toString()} />
      )}
    </>
  );
}
