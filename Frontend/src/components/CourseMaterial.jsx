import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import { toast, Toaster } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MaterialTable from "./ui/materials-table";

const CourseMaterial = () => {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => { 
      try {
        const res = await axiosInstance.get(`${API_URL}/api/material/${courseId}`);
        setMaterials(res.data.data);
        
        // Optionally fetch course name if available in your API
        if (res.data.course_name) {
          setCourseName(res.data.course_name);
        }
      } catch (err) {
        toast.error(
          <div align="left">
            <strong>Failed to load materials</strong>
            <br />
            {err.response?.data?.message || "Could not retrieve course materials"}
          </div>
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [courseId]);

  return (
    <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border">
      <Toaster position="top-right" richColors />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            {courseName ? `${courseName} - Materials` : 'Course Materials'}
          </CardTitle>
        </CardHeader>
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
    </div>
  );
};

export default CourseMaterial;