import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Link, Clock, User } from "lucide-react";
import SubmissionDrawer from './SubmissionDrawer';
import axios from 'axios';

const AssignmentDetailsPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null);
  
  const assignmentId = "assign123"; // This would come from route params in a real app
  const studentId = "student456"; // This would come from auth context in a real app
  
  useEffect(() => {
    // Fetch assignment details
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await axios.get(`/api/assignments/${assignmentId}`);
        // setAssignment(response.data);
        
        // Mock data for demonstration
        setAssignment({
          assignmentId: assignmentId,
          title: "Research Paper on Climate Change",
          description: "Write a 5-page research paper on the effects of climate change on marine ecosystems. Include at least 5 academic sources.",
          dueDate: "2025-04-20T23:59:00",
          resources: [
            { id: 1, name: "Research Guidelines.pdf", url: "#" },
            { id: 2, name: "Citation Format.docx", url: "#" }
          ],
          assignmentType: "Essay",
          gradeRelease: "After Submission",
          defaultGrade: 100,
          courseId: "course789",
          createdBy: "Professor Smith",
          createdAt: "2025-04-01T10:00:00"
        });
        
        // Check if student has already submitted
        // const submissionResponse = await axios.get(`/api/submissions?assignmentId=${assignmentId}&studentId=${studentId}`);
        // if (submissionResponse.data.length > 0) {
        //   setSubmission(submissionResponse.data[0]);
        // }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load assignment details");
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchAssignmentData();
  }, [assignmentId, studentId]);

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

  if (loading) return <div className="flex justify-center items-center h-64">Loading assignment details...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!assignment) return <div className="p-4">Assignment not found</div>;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assignment Details</h1>
        <Button 
          variant="outline" 
          onClick={() => setIsDrawerOpen(true)}
          className="border-black hover:bg-gray-100"
          disabled={!!submission}
        >
          {submission ? "View Submission" : "Submit Assignment"}
        </Button>
      </div>
      
      <Card className="mb-8 border-black">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <User className="h-4 w-4 mr-1" /> {assignment.createdBy}
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-black">
              {assignment.defaultGrade} Points
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{assignment.description}</p>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Due: {formatDate(assignment.dueDate)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Badge variant="secondary" className="mr-2">
                {assignment.assignmentType}
              </Badge>
              <span>Grade Release: {assignment.gradeRelease}</span>
            </div>
            
            <Separator className="my-4 bg-gray-300" />
            
            <div>
              <h3 className="font-semibold mb-2">Resources</h3>
              {assignment.resources && assignment.resources.length > 0 ? (
                <ul className="space-y-2">
                  {assignment.resources.map(resource => (
                    <li key={resource.id} className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <a href={resource.url} className="text-gray-700 hover:underline">
                        {resource.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No resources provided</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="text-sm text-gray-500 border-t border-gray-200 pt-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Created on {formatDate(assignment.createdAt)}</span>
          </div>
        </CardFooter>
      </Card>
      
      {/* Submission Status Card */}
      <Card className="border-black">
        <CardHeader>
          <CardTitle className="text-xl">Submission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Status: <span className="font-medium">
                  {submission ? "Submitted" : "Not Submitted"}
                </span>
              </p>
              {submission ? (
                <p className="text-gray-600 mt-1">
                  Submitted on: <span className="font-medium">{formatDate(submission.submittedDate)}</span>
                </p>
              ) : (
                <p className="text-gray-600 mt-1">
                  Due in: <span className="font-medium">{getTimeRemaining(assignment.dueDate)}</span>
                </p>
              )}
            </div>
            <Button 
              onClick={() => setIsDrawerOpen(true)}
              className="bg-black text-white hover:bg-gray-800"
            >
              {submission ? "View Submission" : "Submit Assignment"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Submission Drawer Component */}
      <SubmissionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        assignmentId={assignment.assignmentId}
        assignmentTitle={assignment.title}
        existingSubmission={submission}
        studentId={studentId}
        onSubmissionComplete={(newSubmission) => setSubmission(newSubmission)}
      />
    </div>
  );
};

export default AssignmentDetailsPage;