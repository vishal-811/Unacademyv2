import AdminLayout from "../components/AdminLayout";
import Navbar from "../components/Navbar";
import UserLayout from "../components/UserLayout";
import { RoleType, useRole } from "../strore/useRole";

export default function Layout() {
  const role = useRole((state) => state.role);

  return (
    <>
      <Navbar />
      {role === RoleType.instructor ? <AdminLayout /> : <UserLayout />}
    </>
  );
}
