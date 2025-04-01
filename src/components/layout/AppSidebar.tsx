
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { BarChart, Users, Calendar, Settings } from "lucide-react";

interface AppSidebarProps {
  open: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ open }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <BarChart size={18} /> },
    { path: "/groups", label: "Groups", icon: <Users size={18} /> },
    { path: "/attendance", label: "Take Attendance", icon: <Calendar size={18} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside
      className={cn(
        "bg-sidebar fixed left-0 top-16 h-[calc(100vh-4rem)] z-10 w-64 shadow-lg transition-transform duration-300 ease-in-out transform",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0"
      )}
    >
      <div className="py-8 px-4 h-full flex flex-col">
        <div className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block w-full"
            >
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        <div className="pt-4 mt-auto border-t border-sidebar-border">
          <p className="text-sidebar-foreground/80 text-xs text-center">
            Unity Tracker v1.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
