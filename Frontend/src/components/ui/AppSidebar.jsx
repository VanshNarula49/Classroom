import React, { useState, useEffect } from "react";
import { Home, Database, LogOut, ChevronDown, Plus, BookOpen, Users, Settings, Menu } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Queries", url: "/queries", icon: Database },
];

export function AppSidebar() {
  const { isCollapsed } = useSidebar();
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  // Add animation states
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  const handleJoinClass = async () => {
    try {
      if (!joinCode.trim()) {
        toast.error("Please enter a class code");
        return;
      }
      
      const response = await axiosInstance.post(`${API_URL}/api/courses/join`, { code: joinCode });
      if (response.data.status === "success") {
        toast.success("Successfully joined the course!");
        navigate("/dashboard");
        setJoinCode("");
        setIsJoinClassOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while joining.");
    }
  };

  const handleLogout = () => {
    toast.loading("Logging out...");
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }, 800);
  };

  // Check if a menu item is active based on the current URL
  const isActive = (url) => {
    return location.pathname === url;
  };

  return (
    <Sidebar collapsible="icon" className="h-screen fixed border-r border-border">
      <TooltipProvider delayDuration={400}>
        <Toaster position="top-right" richColors />
        <SidebarContent>
          <div className="flex flex-col justify-between h-full py-2">
            <div className="space-y-4">
              {/* Logo or Header */}
              <div className="px-3 flex items-center justify-between h-10">
                <h2 className={cn(
                  "text-lg font-semibold tracking-tight transition-opacity",
                  isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
                )}>
                  Classroom
                </h2>
                {!isCollapsed && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-8 w-8 hover:bg-muted transition-colors"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <SidebarSeparator />
              
              {/* Main Menu */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs text-muted-foreground font-medium">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild
                          isActive={isActive(item.url)}
                          className="transition-all duration-200 hover:translate-x-1"
                          tooltip={isCollapsed ? item.title : null}
                        >
                          <a 
                            href={item.url} 
                            className="flex items-center gap-2"
                            onMouseEnter={() => setIsMenuHovered(true)}
                            onMouseLeave={() => setIsMenuHovered(false)}
                          >
                            <item.icon className={cn(
                              "h-4 w-4 transition-all duration-300", 
                              isActive(item.url) ? "text-primary" : "text-muted-foreground",
                              isMenuHovered && "scale-110"
                            )} />
                            <span className={cn(
                              "transition-all duration-200",
                              isActive(item.url) ? "font-medium text-primary" : "text-muted-foreground"
                            )}>
                              {item.title}
                            </span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    
                    {/* Join Class Menu Item */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => !isCollapsed && setIsJoinClassOpen(!isJoinClassOpen)}
                        className={cn(
                          "w-full transition-all duration-200",
                          !isCollapsed && "hover:translate-x-1",
                          isJoinClassOpen && "bg-muted"
                        )}
                        tooltip={isCollapsed ? "Join Class" : null}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Plus className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                            isJoinClassOpen && "rotate-45 text-primary"
                          )} />
                          <span className="transition-opacity duration-200 text-muted-foreground">
                            Join Class
                          </span>
                          {!isCollapsed && (
                            <ChevronDown
                              className={cn(
                                "ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200",
                                isJoinClassOpen ? "rotate-180" : ""
                              )}
                            />
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Join Class Dropdown Content */}
              {!isCollapsed && isJoinClassOpen && (
                <div className="mt-1 space-y-2 px-3 py-2 bg-muted/50 mx-2 rounded-md animate-in slide-in-from-top-5 duration-300">
                  <Input
                    placeholder="Enter class code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="h-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/50 bg-background"
                  />
                  <Button 
                    size="sm" 
                    className="w-full text-xs h-8 transition-all hover:shadow-md" 
                    onClick={handleJoinClass}
                  >
                    Join
                  </Button>
                </div>
              )}
            </div>

            {/* Logout Section */}
            <SidebarFooter>
              <SidebarSeparator />
              <div className="px-1 pt-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          asChild
                          className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
                          tooltip={isCollapsed ? "Logout" : null}
                        >
                          <button 
                            className="flex items-center gap-2 w-full" 
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4 shrink-0 group-hover:text-destructive transition-colors" />
                            <span className="transition-all duration-200 group-hover:font-medium">
                              Logout
                            </span>
                          </button>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">Logout</TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </SidebarFooter>
          </div>
        </SidebarContent>
      </TooltipProvider>
    </Sidebar>
  );
}