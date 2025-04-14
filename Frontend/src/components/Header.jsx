import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { PlusCircle } from "lucide-react";

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

  const [open, setOpen] = useState(false);
  const [classroomName, setClassroomName] = useState("");
  const [classroomDescription, setClassroomDescription] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleCreateClassroom = async () => {
    if (!classroomName.trim()) {
      toast.error("Classroom name is required");
      return;
    }

    try {
      const res = await axiosInstance.post(`${API_URL}/api/courses`, {
        name: classroomName,
        description: classroomDescription,
      });

      if (res.data.status === "success") {
        toast.success("Classroom created successfully!");
        setClassroomName("");
        setClassroomDescription("");
        setOpen(false);
        // Optionally trigger a refresh or redirect
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create classroom"
      );
    }
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-xl">{firstName}'s Classroom</h1>
      </div>
      <div className="flex items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              Create Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Classroom</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <Input
                placeholder="Classroom Name"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
              />
              <Textarea
                placeholder="Classroom Description (optional)"
                value={classroomDescription}
                onChange={(e) => setClassroomDescription(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateClassroom}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}