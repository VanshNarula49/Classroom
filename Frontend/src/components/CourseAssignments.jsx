import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import { toast, Toaster } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssignmentTable from "./ui/assignment-table";

const CourseAssignment = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => { 
      try {
        const res = await axiosInstance.get(`${API_URL}/api/assignments/${courseId}`);
        setAssignments(res.data.data);
        
        // Optionally fetch course name if available in your API
        if (res.data.course_name) {
          setCourseName(res.data.course_name);
        }
      } catch (err) {
        toast.error(
          <div align="left">
            <strong>Failed to load assignments</strong>
            <br />
            {err.response?.data?.message || "Could not retrieve course assignments"}
          </div>
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [courseId]);

  return (
    <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border">
      <Toaster position="top-right" richColors />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{courseName ? `Assignments for ${courseName}` : 'Course Assignments'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground p-4">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground p-4">No assignments created yet for this course.</p>
          ) : (
            <AssignmentTable assignments={assignments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseAssignment;