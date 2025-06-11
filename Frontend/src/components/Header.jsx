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


  const handleCreateClassroom = async () => {
    if (!classroomName.trim()) {
      toast.error("Classroom name is required");
      return;
    }

    try {
      const res = await axiosInstance.post(`/api/courses`, {
        name: classroomName,
        description: classroomDescription,
      });

      if (res.data.status === "success") {
        toast.success("Classroom created successfully!");
        setClassroomName("");
        setClassroomDescription("");
        setCreateOpen(false);
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create classroom");
    }
  };

  const handleJoinClass = async () => {
    if (!classroomCode.trim()) {
      toast.error("Classroom code is required");
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/courses/join`, {
        code: classroomCode,
      });

      if (response.data.status === "success") {
        toast.success("Successfully joined the course!");
        setClassroomCode("");
        setJoinOpen(false);
        // navigate("/dashboard");
        window.location.reload();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while joining."
      );
    }
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white relative">
      <SidebarTrigger />
      {/* Centered Title */}
      <h1
        className="font-semibold text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0 p-0 whitespace-nowrap pointer-events-none select-none"
        style={{ zIndex: 1 }}
      >
        {firstName}'s Classroom
      </h1>
      <div className="flex items-center gap-4 ml-auto">
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
