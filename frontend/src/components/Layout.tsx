import AdminLayout from "./AdminLayout";
import Navbar from "./Navbar";
import UserLayout from "./UserLayout";
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
