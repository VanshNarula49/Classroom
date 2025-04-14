import React, { useState } from "react";
import { Home, Database, LogOut, ChevronDown, Plus } from "lucide-react";


import {
 Sidebar,
 SidebarContent,
 SidebarGroup,
 SidebarGroupContent,
 SidebarGroupLabel,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";


const items = [
 { title: "Home", url: "/dashboard", icon: Home },
 { title: "Queries", url: "/queries", icon: Database },
];


export function AppSidebar() {
 const { isCollapsed } = useSidebar();
 const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
 const [joinCode, setJoinCode] = useState("");
 const navigate = useNavigate();
 const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


 const handleJoinClass = async () => {
   try {
     const response = await axiosInstance.post(`${API_URL}/api/courses/join`, { code: joinCode });
     if (response.data.status === "success") {
       toast.success("Successfully joined the course!");
       navigate("/dashboard");
       setJoinCode("");
     }
   } catch (error) {
     toast.error(error.response?.data?.message || "An error occurred while joining.");
   }
 };


 const handleLogout = () => {
   localStorage.removeItem("token");
   localStorage.removeItem("user");
   window.location.href = "/login";
 };


 return (
   <Sidebar collapsible="icon" className="h-screen fixed">
     <Toaster position="top-right" richColors />
     <SidebarContent>
       <div className="flex flex-col justify-between h-full">
         <div>
           {/* Main Menu */}
           <SidebarGroup>
             <SidebarGroupLabel>Application</SidebarGroupLabel>
             <SidebarGroupContent>
               <SidebarMenu>
                 {items.map((item) => (
                   <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild>
                       <a href={item.url} className="flex items-center gap-2">
                         <item.icon className="h-4 w-4" />
                         <span className="transition-opacity duration-200">
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
                     className="w-full"
                   >
                     <div className="flex items-center gap-2 w-full">
                       <Plus className="h-4 w-4 shrink-0" />
                       <span className="transition-opacity duration-200">
                         Join Class
                       </span>
                       {!isCollapsed && (
                         <ChevronDown
                           className={`ml-auto h-4 w-4 transition-transform ${
                             isJoinClassOpen ? "rotate-180" : ""
                           }`}
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
             <div className="mt-2 space-y-2 px-3">
               <Input
                 placeholder="Enter class code"
                 value={joinCode}
                 onChange={(e) => setJoinCode(e.target.value)}
                 className="h-8 text-xs"
               />
               <Button size="sm" className="w-full text-xs" onClick={handleJoinClass}>
                 Join
               </Button>
             </div>
           )}
         </div>


         {/* Logout Button */}
         <div className="p-2">
           <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton asChild>
                 <button className="flex items-center gap-2 w-full" onClick={handleLogout}>
                   <LogOut className="h-4 w-4 shrink-0" />
                   <span className="transition-opacity duration-200">
                     Logout
                   </span>
                 </button>
               </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
         </div>
       </div>
     </SidebarContent>
   </Sidebar>
 );
}