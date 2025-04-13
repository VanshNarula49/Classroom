import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import axiosInstance from "@/utils/axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AnnouncementDetail = () => {
  const { announcementId } = useParams();
  const location = useLocation();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First try to get announcement from location state
    if (location.state?.announcement) {
      setAnnouncement(location.state.announcement);
      setLoading(false);
    } else {
      // Fallback: fetch announcement details
      const fetchAnnouncementDetails = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`${API_URL}/api/announcement/details/${announcementId}`);
          setAnnouncement(response.data.data);
        } catch (err) {
          toast.error(
            <div align="left">
              <strong>Failed to load announcement details</strong><br />
              {err.response?.data?.message || "Could not retrieve announcement details"}
            </div>
          );
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAnnouncementDetails();
    }
  }, [announcementId, location.state]);

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading announcement details...</p>;
  }

  if (!announcement) {
    return <p className="p-6 text-muted-foreground">Announcement not found.</p>;
  }

  return (
    <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border">
      <Toaster position="top-right" richColors />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{announcement.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Posted by <span className="font-medium">{announcement.createdBy}</span> on{" "}
            {new Date(announcement.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div>
            <p className="text-base">{announcement.content || "No content provided."}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementDetail;