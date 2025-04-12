import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Clock, User, ExternalLink } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { toast, Toaster } from "sonner";
import SubmissionDrawer from './SubmissionDrawer';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Assignment = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null);
  
  useEffect(() => {
    // Get assignment from location state
    if (location.state?.assignment) {
      setAssignment(location.state.assignment);
      setLoading(false);
    } else {
      // Fallback in case the page is accessed directly without state
      const fetchAssignmentDetails = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`${API_URL}/api/assignment/details/${assignmentId}`);
          setAssignment(response.data.data);
        } catch (err) {
          setError("Failed to load assignment details");
          toast.error(
            <div align="left">
              <strong>Failed to load assignment details</strong>
              <br />
              {err.response?.data?.message || "Could not retrieve assignment details"}
            </div>
          );
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAssignmentDetails();
    }
  }, [assignmentId, location.state]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Calculate time remaining until due date
  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    
    if (diffTime < 0) return "Past due";
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
  };

  const handleSubmitClick = () => {
    setIsDrawerOpen(true);
  };
  
  const handleViewResource = () => {
    if (assignment.resources) {
      window.open(assignment.resources, '_blank');
    } else {
      toast.error("No resource URL available");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading assignment details...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!assignment) return <div className="p-4">Assignment not found</div>;

  return (
    <div className="container mx-auto py-6">
      <Toaster position="top-right" richColors />
      
      <Card className="mx-auto max-w-4xl border-black">
        {/* Header with title and due date */}
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">{assignment.title}</CardTitle>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" /> 
                <span>Created by {assignment.creator_name}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Due: {formatDate(assignment.duedate)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700">{assignment.description}</p>
          </div>
          
          <Separator className="my-5" />
          
          {/* Resources */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Resources</h3>
            {assignment.resources ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewResource}
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Resource
              </Button>
            ) : (
              <p className="text-gray-500">No resources provided</p>
            )}
          </div>
          
          <Separator className="my-5" />
          
          {/* Submission section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium mb-2">Submission</h3>
                <p className="text-gray-600">
                  Status: <span className="font-medium">
                    {submission ? "Submitted" : "Not Submitted"}
                  </span>
                </p>
                {submission ? (
                  <p className="text-gray-600 text-sm mt-1">
                    Submitted on: <span className="font-medium">{formatDate(submission.submittedDate)}</span>
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm mt-1">
                    Due in: <span className="font-medium">{getTimeRemaining(assignment.duedate)}</span>
                  </p>
                )}
              </div>
              <Button 
                onClick={handleSubmitClick}
                className="bg-black text-white hover:bg-gray-800"
              >
                {submission ? "View Submission" : "Submit Assignment"}
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Created on {formatDate(assignment.createdat)}</span>
          </div>
        </CardFooter>
      </Card>
      <SubmissionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        assignmentId={assignment.assignmentid}
        assignmentTitle={assignment.title}
        existingSubmission={submission}
        onSubmissionComplete={(newSubmission) => setSubmission(newSubmission)}
      />
    </div>
  );
};

export default Assignment;