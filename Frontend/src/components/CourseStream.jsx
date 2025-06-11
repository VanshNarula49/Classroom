import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import MaterialCard from "./ui/material-stream";
import AssignmentCard from "./ui/assignment-stream";
import AnnouncementCard from "./ui/announcement-stream";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import AnnouncementDialog from "./ui/announcement-dialog";

export default function StreamView() {
  const { courseId } = useParams();
  const [streamItems, setStreamItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stream items and user role in parallel
        const [streamResponse, roleResponse] = await Promise.all([
          axiosInstance.get(`/courses/${courseId}/stream`),
          axiosInstance.get(`/courses/${courseId}/role`)
        ]);

        if (streamResponse.data.status === "success") {
          setStreamItems(streamResponse.data.data);
        } else {
          toast.error(
            <div align="left">
              <strong>Could not load stream items</strong>
              <br />
              {streamResponse.data.message || "Unknown error occurred"}
            </div>
          );
        }

        // Set user role
        setUserRole(roleResponse.data.data.role);
      } catch (err) {
        toast.error(
          <div align="left">
            <strong>Failed to load course data</strong>
            <br />
            {err.response?.data?.message || "Could not retrieve course information"}
          </div>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleAnnouncementPosted = (newAnnouncement) => {
    // Add the new announcement to the stream items at the top
    if (newAnnouncement) {
      const announcementStreamItem = {
        ...newAnnouncement,
        type: "announcement",
        id: newAnnouncement.announcementid,
        creator_name: newAnnouncement.createdBy || "Instructor", // Fallback name
        stream_createdat: newAnnouncement.createdat
      };
      
      setStreamItems(prevItems => [announcementStreamItem, ...prevItems]);
    }
  };

  if (loading) {
    return <div className="flex-1 p-6 text-muted-foreground">Loading course stream...</div>;
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 relative">
      <Toaster position="top-right" richColors />
      
      {streamItems.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          No items in this course stream yet.
        </div>
      ) : (
        <div className="flex flex-col space-y-3 w-full">
          {streamItems.map((item) => {
            switch (item.type) {
              case "announcement":
                return (
                  <AnnouncementCard
                    key={`announcement-${item.id}`}
                    id={item.id}
                    title={item.title}
                    createdBy={item.creator_name}
                    createdAt={new Date(item.stream_createdat).toLocaleDateString()}
                    content={item.content}
                  />
                );
              case "assignment":
                return (
                  <AssignmentCard
                    key={`assignment-${item.id}`}
                    id={item.id}
                    title={item.title}
                    createdBy={item.creator_name}
                    createdAt={new Date(item.stream_createdat).toLocaleDateString()}
                    dueDate={item.duedate && new Date(item.duedate).toLocaleDateString()}
                    description={item.description}
                    assignmentType={item.assignmenttype}
                    item={item}
                  />
                );
              case "material":
                return (
                  <MaterialCard
                    key={`material-${item.id}`}
                    id={item.id}
                    title={item.title}
                    createdBy={item.creator_name}
                    createdAt={new Date(item.stream_createdat).toLocaleDateString()}
                    type={item.material_type}
                    description={item.description}
                    filepath={item.filepath}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      )}
      
      {/* Create Announcement Button - Only visible to non-student users */}
      {userRole && userRole !== "Student" && (
        <Button
          onClick={() => setIsAnnouncementDialogOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full shadow-lg px-4 py-2"
        >
          Create Announcement
        </Button>
      )}
      
      {/* Announcement Dialog */}
      <AnnouncementDialog
        isOpen={isAnnouncementDialogOpen}
        onClose={() => setIsAnnouncementDialogOpen(false)}
        onAnnouncementPosted={handleAnnouncementPosted}
      />
    </div>
  );
}