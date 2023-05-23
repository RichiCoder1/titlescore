import { Outlet } from "react-router-dom";
import Navbar from "~/components/nav/Navbar";

export const DefaultLayout = () => {
  return (
    <>
      <div className={`relative min-h-screen flex flex-col`}>
        <Navbar />
        <Outlet />
      </div>
    </>
  );
};
