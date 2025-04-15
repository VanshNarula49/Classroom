import React, { useState } from "react";
import { Home, Database, LogOut, Menu, Layers } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Queries", url: "/queries", icon: Database },
];

export function AppSidebar() {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const handleLogout = () => {
    toast.loading("Logging out...");
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }, 800);
  };

  const isActive = (url) => {
    return location.pathname === url;
  };

  return (
    <Sidebar collapsible="icon" className="h-screen fixed border-r border-border">
      <TooltipProvider delayDuration={400}>
        <Toaster position="top-right" richColors />
        <SidebarContent>
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-2">
              {/* Logo Section */}
              <div className="h-14 flex items-center justify-end px-3 pr-5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className={cn(
                        "flex items-center gap-3 transition-all duration-300 ease-in-out",
                        isCollapsed ? "justify-end w-fit" : "w-full"
                      )}
                      onMouseEnter={() => setIsLogoHovered(true)}
                      onMouseLeave={() => setIsLogoHovered(false)}
                      onClick={() => navigate('/dashboard')}
                    >
                      <div className={cn(
                        "shrink-0 rounded-md bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center transition-all duration-500 ",
                        isCollapsed ? "h-5 w-5" : "h-9 w-9",
                        isLogoHovered ? "shadow-md shadow-primary/20 scale-105" : ""
                      )}> 
                        <Layers className={cn(
                          "text-primary-foreground transition-all duration-500",
                          isCollapsed ? "h-3.5 w-3.5" : "h-4 w-4"
                        )} />
                      </div>
                      <div className={cn(
                        "flex overflow-hidden transition-all duration-300",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      )}>
                        <span className={cn(
                          "font-semibold text-lg whitespace-nowrap transition-all duration-300",
                          isLogoHovered ? "text-primary" : "text-foreground"
                        )}>
                          Campus<span className="text-primary font-bold">Cloud</span>
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">CampusCloud</TooltipContent>}
                </Tooltip>
              </div>
              
              <SidebarSeparator />
              
              {/* Navigation Menu */}
              <div className="pt-2">
                <SidebarGroup>
                  <SidebarGroupLabel className={cn(
                    "px-3 text-xs text-muted-foreground font-medium transition-all duration-300",
                    isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto mb-2"
                  )}>
                    Navigation
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton 
                                asChild
                                isActive={isActive(item.url)}
                                className="transition-all duration-200 hover:translate-x-1 overflow-hidden px-3"
                              >
                                <a 
                                  href={item.url} 
                                  className="flex items-center gap-3 relative"
                                  onMouseEnter={() => {
                                    setIsMenuHovered(true);
                                    setActiveItem(item.title);
                                  }}
                                  onMouseLeave={() => {
                                    setIsMenuHovered(false);
                                    setActiveItem(null);
                                  }}
                                >
                                  <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-0 bg-primary/10 rounded-lg -z-10 transition-all duration-300",
                                    (isActive(item.url) || activeItem === item.title) ? "w-full" : ""
                                  )} />
                                  <item.icon className={cn(
                                    "shrink-0 transition-all duration-300", 
                                    isCollapsed ? "h-4 w-4" : "h-4 w-4",
                                    isActive(item.url) ? "text-primary" : "text-muted-foreground",
                                    activeItem === item.title && "scale-110 rotate-3"
                                  )} />
                                  <div className={cn(
                                    "overflow-hidden transition-all duration-300 flex",
                                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                  )}>
                                    <span className={cn(
                                      "transition-all duration-200 whitespace-nowrap",
                                      isActive(item.url) ? "font-medium text-primary" : "text-muted-foreground",
                                      activeItem === item.title && "font-medium"
                                    )}>
                                      {item.title}
                                    </span>
                                  </div>
                                </a>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                          </Tooltip>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </div>
            </div>

            {/* Logout Section */}
            <SidebarFooter>
              <SidebarSeparator />
              <div className="p-2">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          asChild
                          className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group px-3"
                        >
                          <button 
                            className="flex items-center gap-3 w-full relative overflow-hidden" 
                            onClick={handleLogout}
                          >
                            <LogOut className={cn(
                              "shrink-0 group-hover:text-destructive transition-all duration-300 group-hover:rotate-12",
                              isCollapsed ? "h-4 w-4" : "h-4 w-4"
                            )} />
                            <div className={cn(
                              "overflow-hidden transition-all duration-300 flex",
                              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                            )}>
                              <span className="transition-all duration-200 group-hover:font-medium whitespace-nowrap">
                                Logout
                              </span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
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