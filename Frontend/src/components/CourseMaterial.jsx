import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { toast, Toaster } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import MaterialTable from "./ui/materials-table";
import { Button } from "@/components/ui/button";
import MaterialUploadDrawer from "./ui/material-drawer";


const CourseMaterial = () => {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchMaterialsAndRole = async () => {
      try {
        const [materialsRes, roleRes] = await Promise.all([
          axiosInstance.get(`/api/material/${courseId}`),
          axiosInstance.get(`/api/courses/${courseId}/role`)
        ]);

        setMaterials(materialsRes.data.data);
        if (materialsRes.data.data.course_name) {
          setCourseName(materialsRes.data.data.course_name);
        }
        console.log(materialsRes.data.data);
        console.log(materials);

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

    fetchMaterialsAndRole();
  }, [courseId]);

  return (
    <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border relative">
      <Toaster position="top-right" richColors />
      <Card className="w-full">
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground p-4">Loading materials...</p>
          ) : materials.length === 0 ? (
            <p className="text-muted-foreground p-4">No materials uploaded yet for this course.</p>
          ) : (
            <MaterialTable materials={materials} />
          )}
        </CardContent>
      </Card>

      {/* Upload Button */}
      {userRole && userRole !== "Student" && (
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full shadow-lg px-4 py-2"
        >
          Upload Material
        </Button>
      )}

      <MaterialUploadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUploadComplete={() => window.location.reload()}
      />
    </div>
  );
};

export default CourseMaterial;