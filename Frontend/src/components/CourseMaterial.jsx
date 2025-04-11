// src/components/CourseMaterial.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Toaster } from "sonner";
import MaterialCard from "./ui/material-card";

const CourseMaterial = () => {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call with dummy materials
    setTimeout(() => {
      setMaterials([
        {
          materialid: 1,
          title: "Lecture 1: Introduction to Algorithms",
          filepath: "https://example.com/lecture1.pdf",
          createdby: "Prof. Alan Turing",
          createdat: "2025-04-10T10:00:00Z",
        },
        {
          materialid: 2,
          title: "Week 1 Assignment",
          filepath: "https://example.com/assignment1.docx",
          createdby: "TA: Grace Hopper",
          createdat: "2025-04-11T14:30:00Z",
        },
      ]);
      setLoading(false);
    }, 500);
  }, [courseId]);

  return (
    <div className="flex-1 min-w-full max-w-fit mx-auto px-4 py-6">

      {loading ? (
        <p className="text-center text-gray-500">Loading materials...</p>
      ) : materials.length === 0 ? (
        <p className="text-center text-gray-400">No materials uploaded yet.</p>
      ) : (
        <div className="flex-1 w-full h-screen justify-center items-center overflow-auto bg-background">
          {materials.map((material) => (
            <MaterialCard key={material.materialid} material={material} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseMaterial;