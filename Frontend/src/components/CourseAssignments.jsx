import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { toast, Toaster } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import AssignmentTable from "./ui/assignment-table";
import AssignmentUploadDrawer from "./ui/assignnment-drawer";
import { Button } from "@/components/ui/button";


const CourseAssignment = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchAssignmentsAndRole = async () => {
      try {
        const [assignmentsRes, roleRes] = await Promise.all([
          axiosInstance.get(`/assignments/${courseId}`),
          axiosInstance.get(`/courses/${courseId}/role`)
        ]);

        setAssignments(assignmentsRes.data.data);

        if (assignmentsRes.data.course_name) {
          setCourseName(assignmentsRes.data.course_name);
        }

        setUserRole(roleRes.data.data.role);
      } catch (err) {
        toast.error(
          <div align="left">
            <strong>Failed to load data</strong>
            <br />
            {err.response?.data?.message || "Something went wrong while fetching course information."}
          </div>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentsAndRole();
  }, [courseId]);

  // Refresh assignments after drawer closes
  const handleUploadComplete = () => {
    setIsDrawerOpen(false);
    // Optionally, you can refetch assignments here instead of reloading the page
    // fetchAssignmentsAndRole();
    window.location.reload(); // Or use the above line for a better UX
  };

  return (
    <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border relative">
      <Toaster position="top-right" richColors />
      <Card className="w-full">
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

      {/* Create Assignment Button */}
      {userRole && userRole !== "Student" && (
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full shadow-lg px-4 py-2"
        >
          Create Assignment
        </Button>
      )}

      <AssignmentUploadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default CourseAssignment;