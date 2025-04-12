import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import MaterialCard from "./ui/material-stream";
import AssignmentCard from "./ui/assignment-stream";
import AnnouncementCard from "./ui/announcement-stream";
import { toast, Toaster } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function StreamView() {
  const { courseId } = useParams();
  const [streamItems, setStreamItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    const fetchCourseStream = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/api/courses/${courseId}/stream`);
        if (response.data.status === "success") {
          // Set stream items from the response data
          setStreamItems(response.data.data);
        } else {
          toast.error(
            <div align="left">
              <strong>Could not load stream items</strong>
              <br />
              {response.data.message || "Unknown error occurred"}
            </div>
          );
        }
      } catch (err) {
        toast.error(
          <div align="left">
            <strong>Failed to load course stream</strong>
            <br />
            {err.response?.data?.message || "Could not retrieve course information"}
          </div>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStream();
  }, [courseId]);

  if (loading) {
    return <div className="flex-1 p-6 text-muted-foreground">Loading course stream...</div>;
  }

  if (streamItems.length === 0) {
    return <div className="flex-1 p-6 text-muted-foreground">No items in this course stream yet.</div>;
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4">
      <Toaster position="top-right" richColors />
      
      <h2 className="text-2xl font-medium mb-6">{courseName || "Course Stream"}</h2>
      
      <div className="flex flex-col space-y-3 w-full">
        {streamItems.map((item) => {
          switch (item.type) {
            case "announcement":
              return (
                <AnnouncementCard
                  key={`announcement-${item.id}`}
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
                  title={item.title}
                  createdBy={item.creator_name}
                  createdAt={new Date(item.stream_createdat).toLocaleDateString()}
                  dueDate={item.duedate && new Date(item.duedate).toLocaleDateString()}
                  description={item.description}
                  assignmentType={item.assignmenttype}
                />
              );
            case "material":
              return (
                <MaterialCard
                  key={`material-${item.id}`}
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
    </div>
  );
}