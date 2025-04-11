import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const firstName = user?.name?.split(" ")[0] || "User";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-xl">{firstName}'s Classroom</h1>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
