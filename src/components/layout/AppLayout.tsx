
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md z-10 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 text-primary-foreground hover:bg-primary/90"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <h1 className="text-xl font-bold">ROTC Attendance Monitoring System</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden md:inline-block">
            {user?.name}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary/90"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar open={sidebarOpen} />
        
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out overflow-auto p-6",
            sidebarOpen ? "md:ml-64" : "ml-0"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
