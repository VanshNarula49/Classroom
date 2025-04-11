import { useEffect, useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Header } from "./Header"
import { Outlet } from "react-router-dom"

export default function Layout() {
  const [defaultOpen, setDefaultOpen] = useState(true) // fallback to true

  useEffect(() => {
    // Read the cookie from document.cookie
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar="))

    if (match) {
      const value = match.split("=")[1]
      setDefaultOpen(value === "true")
    }
  }, [])

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 max-w-full mx-auto my-5">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
