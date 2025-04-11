import { Calendar, Home, Inbox, Search, Settings, LogOut } from "lucide-react"

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

const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  }
]

export function AppSidebar() {
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user");

    window.location.href = "/login"
  }
  return (
    <Sidebar collapsible="icon">
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
