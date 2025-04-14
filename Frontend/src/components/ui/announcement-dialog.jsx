import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AnnouncementDialog = ({ isOpen, onClose, onAnnouncementPosted }) => {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.error("Please fill in both title and content.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(`${API_URL}/api/announcements/${courseId}`, { 
        title, 
        content
      });
      
      toast.success("Announcement created successfully");
      onClose();
      onAnnouncementPosted(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Input
            placeholder="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Announcement Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Announcement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementDialog;