// import { Calendar, Home, Inbox, Search, Settings, LogOut, Database, Plus } from "lucide-react"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

// const items = [
//   {
//     title: "Home",
//     url: "/dashboard",
//     icon: Home,
//   },
//   {
//     title: "Queries",
//     url: "/queries",
//     icon: Database,
//   },
//   {
//     title: "Join Class",
//     url: "/joinclass",
//     icon: Plus,
//   }
// ]

// export function AppSidebar() {
//   const handleLogout = () => {
//     localStorage.removeItem("token")
//     localStorage.removeItem("user");

//     window.location.href = "/login"
//   }
//   return (
//     <Sidebar collapsible="icon">
//       <SidebarContent>
//         <div className="flex flex-col justify-between h-full">
//           {/* Top Section */}
//           <div>
//             <SidebarGroup>
//               <SidebarGroupLabel>Application</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   {items.map((item) => (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton asChild>
//                         <a href={item.url}>
//                           <item.icon />
//                           <span>{item.title}</span>
//                         </a>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           </div>

//           {/* Logout Button at Bottom */}
//           <div className="p-2">
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                   <button onClick={handleLogout}>
//                     <LogOut />
//                     <span>Logout</span>
//                   </button>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </div>
//         </div>
//       </SidebarContent>
//     </Sidebar>
//   )
// }
import React, { useState } from "react"
import { Calendar, Home, Inbox, Search, Settings, LogOut, Database, Plus } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import { useNavigate } from "react-router-dom"
import axiosInstance from "@/utils/axiosInstance"

const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Queries",
    url: "/queries",
    icon: Database,
  },
  // Removed Join Class from the menu
]

export function AppSidebar() {
  const [joinCode, setJoinCode] = useState("")
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleJoinClass = async () => {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/courses/join`, { code: joinCode });
      if (response.data.status === "success") {
        toast.success("Successfully joined the course!");
        navigate('/dashboard'); // Redirect to dashboard on success
      } else {
        toast.error(response.data.message || "Failed to join the course.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while joining.");
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <Sidebar collapsible="icon">
      <Toaster position="top-right" richColors />
      <SidebarContent>
        <div className="flex flex-col justify-between h-full">
          {/* Top Section */}
          <div>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Join Class Input */}
            <SidebarGroup>
              <SidebarGroupLabel>Join Class</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="p-2 space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter class code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <Button variant="outline" size="sm" className="w-full" onClick={handleJoinClass}>
                    Join
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {/* Logout Button at Bottom */}
          <div className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={handleLogout}>
                    <LogOut />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}