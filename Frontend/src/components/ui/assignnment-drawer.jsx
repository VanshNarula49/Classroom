import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText } from "lucide-react";
import axios from 'axios';
import { toast, Toaster } from "sonner";
import axiosInstance from '@/utils/axiosInstance';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const AssignmentUploadDrawer = ({ isOpen, onClose, onUploadComplete }) => {
  const { courseId } = useParams();
  const [file, setFile] = useState(null);
  const [fileExtension, setFileExtension] = useState(null);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDateChange = (date) => {
    if (date) {
      // Format date as YYYY-MM-DD for backend
      const formattedDate = date.toISOString().split('T')[0];
      setDueDate(formattedDate);
    } else {
      setDueDate('');
    }
  };

  const handleSubmit = async () => {
    if (!file || !title || !dueDate || !points) {
      toast.error(
        <div align="left">
          <strong>Missing Info</strong><br />
          Please fill all required fields and upload a file.
        </div>
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Get presigned URL from new endpoint
      const presignedRes = await axiosInstance.get(
        `/assignments/${courseId}/presigned-url`,
        { params: { fileExtension } }
      );

      const { url: presignedUrl, key } = presignedRes.data.data;

      // 2. Upload file to S3
      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        }
      });

      // 3. Create assignment, include fileExtension
      await axiosInstance.post(`/api/assignments/${courseId}`, {
        title,
        instructions,
        dueDate,
        points,
        key
      });

      toast.success(
        <div align="left">
          <strong>Assignment Posted</strong><br />
          Successfully uploaded and created assignment.
        </div>
      );

      setTitle('');
      setInstructions('');
      setDueDate('');
      setPoints('');
      setFile(null);
      setUploadProgress(0);
      onClose();
      onUploadComplete?.();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-w-4xl bg-white mx-auto mt-10 rounded-xl shadow-lg flex flex-col max-h-[90vh]">
          <DrawerHeader className="border-b border-gray-200">
            <DrawerTitle className="text-xl">Post Assignment</DrawerTitle>
            <DrawerDescription>Fill in the details and upload the assignment file</DrawerDescription>
          </DrawerHeader>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div className="mb-4">
              <Label className="mb-1 block">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="mb-4">
              <Label className="mb-1 block">Instructions</Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Add any specific instructions for this assignment..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <Label className="mb-1 block">Due Date</Label>
                <DatePicker
                  selected={dueDate ? new Date(dueDate) : null}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholderText="Select a due date"
                  required
                />
              </div>

              <div className="mb-4">
                <Label className="mb-1 block">Points</Label>
                <Input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                  min={0}
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <Label className="mb-1 block">Resources</Label>
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
                {isSubmitting ? "Uploading..." : "Post Assignment"}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AssignmentUploadDrawer;