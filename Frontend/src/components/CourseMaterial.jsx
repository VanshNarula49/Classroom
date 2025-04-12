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

  useEffect(() => {
    // Simulated data
    // setTimeout(() => {
    //   setMaterials([
    //     {
    //       id: 1,
    //       title: "Week 1 - Introduction to AI",
    //       createdby: "Prof. John Doe",
    //       createdat: "2024-04-05T10:00:00Z",
    //       filepath: "https://example.com/ai_intro.pdf",
    //     },
    //     {
    //       id: 2,
    //       title: "Lecture 2 - Neural Networks",
    //       createdby: "Prof. Jane Smith",
    //       createdat: "2024-04-07T14:30:00Z",
    //       filepath: "https://example.com/nn_lecture.pdf",
    //     },
    //   ]);
    //   setLoading(false);
    // }, 500);

    const fetchMaterials = async () => {
      try {
        const res = await axiosInstance.get(`${API_URL}/api/materials/${courseId}`);
        setMaterials(res.data.materials);
      } catch (err) {
        toast.error("Failed to load materials.");
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
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading materials...</p>
          ) : materials.length === 0 ? (
            <p className="text-muted-foreground">No materials uploaded yet.</p>
          ) : (
            <MaterialTable materials={materials} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseMaterial;
