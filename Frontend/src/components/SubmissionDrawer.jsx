import React, { useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText } from "lucide-react";
import axios from 'axios';

const SubmissionDrawer = ({ isOpen, onClose, assignmentId, assignmentTitle }) => {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Get presigned URL
      const presignedUrlResponse = await axios.get(`/api/get-presigned-url?filename=${file.name}&assignmentId=${assignmentId}`);
      const { url: presignedUrl, key } = presignedUrlResponse.data;

      // Step 2: Upload file to presigned URL
      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Step 3: Create submission record
      const submissionData = {
        AssignmentId: assignmentId,
        StudentId: 'current-user-id', // Replace with actual user ID or fetch from auth context
        SubmittedDate: new Date().toISOString(),
        FilePath: key,
        Comment: comment
      };

      await axios.post('/api/submissions', submissionData);

      setIsSubmitting(false);
      setFile(null);
      setComment('');
      setUploadProgress(0);
      onClose();
      alert("Assignment submitted successfully!");
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setIsSubmitting(false);
      alert("Failed to submit assignment. Please try again.");
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-gray-200">
          <DrawerTitle className="text-xl">Submit Assignment</DrawerTitle>
          <DrawerDescription>
            {assignmentTitle}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-6">
          <div className="mb-6">
            <Label htmlFor="file-upload" className="block mb-2 font-medium">
              Upload File
            </Label>
            
            {!file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or other files (max 10MB)</p>
                  </div>
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={removeFile}
                  className="h-8 w-8"
                >
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
          
          <div className="mb-6">
            <Label htmlFor="comment" className="block mb-2 font-medium">
              Comment (Optional)
            </Label>
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
              <Button variant="outline" className="border-black">
                Cancel
              </Button>
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
  );
};

export default SubmissionDrawer;