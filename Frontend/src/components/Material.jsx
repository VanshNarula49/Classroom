import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

const MaterialDetail = () => {
  const { materialId } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API fetch
    setTimeout(() => {
      setMaterial({
        id: materialId,
        title: "Lecture 2 - Neural Networks",
        createdby: "Prof. Jane Smith",
        createdat: "2024-04-07T14:30:00Z",
        filepath: "https://example.com/nn_lecture.pdf",
        description: "This lecture covers the basics of artificial neural networks, including perceptrons, activation functions, and multilayer networks.",
      });
      setLoading(false);
    }, 500);

    // Real API example
    // axiosInstance.get(`${API_URL}/api/materials/${materialId}`)
    //   .then(res => {
    //     setMaterial(res.data);
    //   }).catch(err => {
    //     toast.error("Failed to fetch material details");
    //   }).finally(() => setLoading(false));
  }, [materialId]);

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading material details...</p>;
  }

  if (!material) {
    return <p className="p-6 text-muted-foreground">Material not found.</p>;
  }

  return (
    <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border">
      <Toaster position="top-right" richColors />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{material.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Uploaded by <span className="font-medium">{material.createdby}</span> on{" "}
            {new Date(material.createdat).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-1">Description</h3>
            <p className="text-sm text-muted-foreground">{material.description}</p>
          </div>
          <div className="pt-4">
            <Button variant="default" onClick={() => window.open(material.filepath, "_blank")}>
              View Material
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialDetail;