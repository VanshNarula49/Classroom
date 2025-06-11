import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Clock, User } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { toast, Toaster } from "sonner";
import SubmissionDrawer from './SubmissionDrawer';
import {
  Popover, PopoverTrigger, PopoverContent
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area"


const Assignment = () => {
  const { assignmentId } = useParams();
  const { courseId } = useParams();
  const location = useLocation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [userRole, setUserRole] = useState("");

  const fetchUserRole = async (assignmentId) => {
    try {
      const res = await axiosInstance.get(`/api/courses/${courseId}/role`);
      if (res.data?.data?.role) {
        setUserRole(res.data.data.role);
      }
    } catch (error) {
      console.error("Error fetching user role", error);
    }
  };

  const fetchSubmission = async () => {
    try {
      const res = await axiosInstance.get(`/api/submissions/assignment/${assignmentId}`);
      if (res.data.status === "success") {
        setSubmission({
          ...res.data.data,
          submittedDate: res.data.data.submitteddate,
          key: res.data.data.fileUrl,
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error(
          <div align="left">
            <strong>Failed to load submission</strong><br />
            {error.response?.data?.message || "Unexpected error occurred."}
          </div>
        );
      }
      setSubmission(null);
    }
  };

  const fetchAssignmentDetails = async () => {
    try {
      const res = await axiosInstance.get(`/api/assignments/${assignmentId}`);
      if (res.data.status === "success") {
        setAssignment(res.data.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        <div align="left">
          <strong>Failed to load assignment</strong><br />
          {error.response?.data?.message || "Unexpected error occurred."}
        </div>
      );
    }
  };

  useEffect(() => {
    fetchUserRole(assignmentId);

    if (location.state?.assignment) {
      setAssignment(location.state.assignment);
      setLoading(false);
      fetchSubmission();
    } else {
      fetchAssignmentDetails().then(fetchSubmission);
    }
  }, [assignmentId, location.state]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isPastDue = () => {
    const now = new Date();
    const due = new Date(assignment.duedate);
    return now > due;
  };

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

  const handleSubmitClick = () => setIsDrawerOpen(true);

  const handleViewResource = () => {
    if (assignment.resources) {
      window.open(assignment.resources, '_blank');
    } else {
      toast.error(
        <div align="left">
          <strong>No Resource</strong><br />
          No resource URL available
        </div>
      );
    }
  };

  const handleViewSubmission = () => {
    if (submission?.key) {
      window.open(submission.key, "_blank");
    } else {
      toast.error(
        <div align="left">
          <strong>No Submission</strong><br />
          No submission file found
        </div>
      );
    }
  };

  const renderGradePopover = () => {
    if (!submission?.grades || submission.grades.length === 0) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 text-sm">
            Grade: {submission.latestScore}/{assignment.defaultgrade}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 shadow-xl border-gray-300">
          <div className="mb-2">
            <p className="text-gray-800 mb-1">Score: <strong>{submission.latestScore}/{assignment.defaultgrade}</strong></p>
            <p className="text-gray-800 mb-1">By: {submission.gradedBy}</p>
            <p className="text-gray-500 text-xs">At: {formatDate(submission.gradedAt)}</p>
            {submission.latestFeedback && (
              <p className="mt-2 text-sm italic text-gray-600">
                "{submission.latestFeedback}"
              </p>
            )}
          </div>
          <Separator className="my-3" />
          <p className="text-xs font-medium text-gray-500 mb-2">Grade History</p>
          <ScrollArea className="h-36 pr-2">
            <ul className="space-y-2 text-sm">
              {submission.grades.map((g) => (
                <li key={g.gradeid} className="border-b pb-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{g.gradeseq}: {g.score}/{assignment.defaultgrade}</span>
                    <span className="text-xs text-gray-400">{formatDate(g.gradedat)}</span>
                  </div>
                  {g.feedback && <p className="text-gray-600 italic">"{g.feedback}"</p>}
                  <p className="text-gray-700">By: {g.grader_name}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading assignment details...</div>;
  if (!assignment) return <div className="p-4">Assignment not found</div>;

  return (
    <div className="flex max-w-full mx-auto py-6 justify-center items-center">
      <Toaster position="top-right" richColors />

      <Card className="mx-auto min-w-3xl max-w-4xl border-black">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold">{assignment.title}</CardTitle>
              {renderGradePopover()}
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
          <div className="mb-6">
            <p className="text-gray-700">{assignment.description}</p>
          </div>

          <Separator className="my-5" />

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

        {userRole === "Student" && (
          <>
            <Separator className="my-5" />
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium mb-2">Submission</h3>
                  <p className="text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        isPastDue() && !submission
                          ? "text-red-600"
                          : submission
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {isPastDue() && !submission
                        ? "Missed"
                        : submission
                        ? "Submitted"
                        : "Not Submitted"}
                    </span>
                  </p>

                  {submission ? (
                    <p className="text-gray-600 text-sm mt-1">
                      Submitted on:{" "}
                      <span className="font-medium">
                        {formatDate(submission.submittedDate)}
                      </span>
                    </p>
                  ) : !isPastDue() && (
                    <p className="text-gray-600 text-sm mt-1">
                      Due in:{" "}
                      <span className="font-medium">
                        {getTimeRemaining(assignment.duedate)}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {submission && (
                    <Button
                      variant="outline"
                      onClick={handleViewSubmission}
                      className="text-black border-black"
                    >
                      View Submission
                    </Button>
                  )}
                  {!isPastDue() && (
                    <Button
                      onClick={handleSubmitClick}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {submission ? "Resubmit Assignment" : "Submit Assignment"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

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
        assignmentTitle={assignment.title}
        onSubmissionComplete={fetchSubmission}
      />
    </div>
  );
};

export default Assignment;