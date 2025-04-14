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
import { Plus, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const firstName = user?.name?.split(" ")[0] || "User";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "??";

  // Separate states for both dialogs 👇
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const [classroomName, setClassroomName] = useState("");
  const [classroomDescription, setClassroomDescription] = useState("");
  const [classroomCode, setClassroomCode] = useState("");

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
        setCreateOpen(false);
        window.location.reload(); // 🔄 Refresh page
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create classroom"
      );
    }
  };

  const handleJoinClass = async () => {
    if (!classroomCode.trim()) {
      toast.error("Classroom code is required");
      return;
    }

    try {
      const response = await axiosInstance.post(`${API_URL}/api/courses/join`, {
        code: classroomCode,
      });

      if (response.data.status === "success") {
        toast.success("Successfully joined the course!");
        setClassroomCode("");
        setJoinOpen(false);
        navigate("/dashboard"); // or window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while joining.");
    }
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-xl">{firstName}'s Classroom</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Join Classroom Dialog */}
        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Join Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join a Classroom</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <Input
                placeholder="Classroom Code"
                value={classroomCode}
                onChange={(e) => setClassroomCode(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleJoinClass}>Join</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Classroom Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
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

        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}