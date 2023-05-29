import { Outlet } from "react-router-dom";
import Navbar from "~/components/nav/Navbar";
import { TooltipProvider } from "~/components/ui/Tooltip";

export const DefaultLayout = () => {
  return (
    <TooltipProvider>
      <div className={`relative flex min-h-screen flex-col pb-4`}>
        <Navbar />
        <Outlet />
      </div>
    </TooltipProvider>
  );
};
