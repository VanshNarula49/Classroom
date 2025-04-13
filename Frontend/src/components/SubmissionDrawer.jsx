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
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SubmissionDrawer = ({ isOpen, onClose, assignmentTitle, onSubmissionComplete }) => {
  const { courseId, assignmentId } = useParams();
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
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

  const handleSubmit = async () => {
    if (!file) {
      toast.error(
        <div align="left">
          <strong>File Missing</strong>
          <br />
          Please select a file to upload before submitting.
        </div>
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const presignedUrlResponse = await axiosInstance.get(`${API_URL}/api/submissions/presigned-url`, {
        params: {
          fileExtension,
          assignmentId,
          courseId
        }
      });

      const { url: presignedUrl, key } = presignedUrlResponse.data.data;

      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const submissionData = {
        assignmentId: assignmentId,
        key: key
      };

      await axiosInstance.post('/api/submissions', submissionData);

      onSubmissionComplete?.({
        submittedDate: new Date().toISOString(),
        comment,
        key
      });

      toast.success(
        <div align="left">
          <strong>Success!</strong>
          <br />
          Assignment submitted successfully.
        </div>
      );

      setFile(null);
      setComment('');
      setUploadProgress(0);
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        <div align="left">
          <strong>Submission Failed</strong>
          <br />
          {error.response?.data?.message || "Something went wrong during submission. Please try again."}
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] max-w-5xl bg-gray-100 mx-auto mt-10 rounded-xl shadow-lg">
          <DrawerHeader className="border-b border-gray-200">
            <DrawerTitle className="text-xl">Submit Assignment</DrawerTitle>
            <DrawerDescription>{assignmentTitle}</DrawerDescription>
          </DrawerHeader>

          <div className="p-6">
            {/* File Upload */}
            <div className="mb-6">
              <Label htmlFor="file-upload" className="block mb-2 font-medium">Upload File</Label>

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
                  <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <Label htmlFor="comment" className="block mb-2 font-medium">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Add a comment for your teacher"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] border-gray-300"
              />
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
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SubmissionDrawer;