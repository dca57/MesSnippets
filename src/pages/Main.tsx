import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const Main: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Sidebar - Always Visible */}
      {/* <SideBar /> */}
      
      {/* Main Content Area */}
      {/* <div className="flex-1 ml-64">  */}
        <div className="flex-1 h-full w-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Main;
