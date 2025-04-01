
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import AppSidebar from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
          <h1 className="text-xl font-bold">Unity Tracker</h1>
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
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
