import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText } from "lucide-react";
import axios from 'axios';
import { toast, Toaster } from "sonner";
import axiosInstance from '@/utils/axiosInstance';


const MaterialUploadDrawer = ({ isOpen, onClose, onUploadComplete }) => {
  const { courseId } = useParams();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('lecture');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileExtension, setFileExtension] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const extension = selectedFile.name.split('.').pop();
    setFileExtension(extension);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!file || !title) {
      toast.error(
        <div align="left">
          <strong>Missing Info</strong>
          <br />
          Please fill all required fields and select a file.
        </div>
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const presignedUrlRes = await axiosInstance.get(
        `/material/${courseId}/presigned-url`,
        { params: { fileExtension } }
      );

      const { url: presignedUrl, key } = presignedUrlRes.data.data;

      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      await axiosInstance.post(`/api/material/${courseId}`, {
        title,
        description,
        type,
        key
      });

      toast.success(
        <div align="left">
          <strong>Success</strong>
          <br />
          Material uploaded successfully.
        </div>
      );

      setFile(null);
      setTitle('');
      setDescription('');
      setType('lecture');
      setUploadProgress(0);
      onClose();
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        <div align="left">
          <strong>Upload Failed</strong>
          <br />
          {error.response?.data?.message || "Something went wrong while uploading the material."}
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-w-5xl bg-white mx-auto mt-10 rounded-xl shadow-lg flex flex-col max-h-[90vh]">  
          <DrawerHeader className="border-b border-gray-200">
            <DrawerTitle className="text-xl">Upload Course Material</DrawerTitle>
            <DrawerDescription>Fill out the form and upload a file</DrawerDescription>
          </DrawerHeader>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Enter a short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>Upload File</Label>
              {!file ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, etc. (max 10MB)</p>
                  </Label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="border-t border-gray-200">
            <div className="flex justify-end gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="border-black">Cancel</Button>
              </DrawerClose>
              <Button
                onClick={handleSubmit}
                disabled={!file || isSubmitting}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isSubmitting ? "Uploading..." : "Upload Material"}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MaterialUploadDrawer;