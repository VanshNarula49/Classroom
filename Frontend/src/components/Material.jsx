import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MaterialDetail = () => {
  const { materialId } = useParams();
  const location = useLocation();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get material from location state
    if (location.state?.material) {
      setMaterial(location.state.material);
      setLoading(false);
    } else {
      // Fallback in case the page is accessed directly without state
      const fetchMaterialDetails = async () => {
        try {
          const res = await axiosInstance.get(`${API_URL}/api/material/detail/${materialId}`);
          setMaterial(res.data.data);
        } catch (err) {
          toast.error(
            <div align="left">
              <strong>Failed to load material details</strong>
              <br />
              {err.response?.data?.message || "Could not retrieve material information"}
            </div>
          );
        } finally {
          setLoading(false);
        }
      };
      
      fetchMaterialDetails();
    }
  }, [materialId, location.state]);

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading material details...</p>;
  }

  if (!material) {
    return <p className="p-6 text-muted-foreground">Material not found.</p>;
  }

  const handleViewMaterial = () => {
    try {
      // Check for both possible property names
      const fileUrl = material.filepath || material.fileUrl;
      
      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        toast.error(
          <div align="left">
            <strong>No File Available</strong>
            <br />
            This material doesn't have an associated file
          </div>
        );
      }
    } catch (error) {
      toast.error(
        <div align="left">
          <strong>Failed to open material</strong>
          <br />
          The file might not be accessible or the URL is invalid
        </div>
      );
    }
  };

  return (
    <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border">
      <Toaster position="top-right" richColors />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{material.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Uploaded by <span className="font-medium">{material.creator_name}</span> on{" "}
            {new Date(material.createdat).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">{material.description || "No description available."}</p>
          </div>
          <div className="pt-4">
            <Button variant="default" onClick={handleViewMaterial}>
              View Material
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default MaterialDetail;