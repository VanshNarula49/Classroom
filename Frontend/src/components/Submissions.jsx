import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfoIcon, FileIcon, CheckIcon, ClockIcon, CalendarIcon, UsersIcon, UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "sonner";


const Submissions = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const passedAssignment = location.state?.assignment 
  console.log("Passed assignment:", passedAssignment);
  // Get the assignment ID either from URL params or from passed assignment
  const assnId = assignmentId 
  
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [gradeUpdates, setGradeUpdates] = useState({});
  const [feedbackUpdates, setFeedbackUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingStates, setSavingStates] = useState({});
  const [gradeReleased, setGradeReleased] = useState(false);

  // Fetch the assignment details directly from the API
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // If we already have the assignment from the passed state, use it
        if (passedAssignment) {
          setAssignment(passedAssignment);
          setGradeReleased(passedAssignment.gradereleased || false);
          return;
        }
        
        // Otherwise fetch from API
        const response = await axiosInstance.get(
          `/api/assignments/single/${assnId}`
        );
        
        setAssignment(response.data.data);
        setGradeReleased(response.data.data.gradereleased || false);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        setError("Failed to load assignment details");
        toast.error("Could not load assignment details");
      }
    };

    if (assnId) {
      fetchAssignment();
    } else {
      setError("Assignment ID is missing");
      setLoading(false);
    }
  }, [assnId, passedAssignment]);

  // Fetch submissions once we have the assignment
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!assnId) {
        setError("Assignment ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        const response = await axiosInstance.get(
          `/api/submissions/assignment/${assnId}/all`
        );
        
        setSubmissions(response.data.data || []);

        // Initialize grade and feedback states from fetched data
        const initialGrades = {};
        const initialFeedback = {};
        
        response.data.data?.forEach(submission => {
          initialGrades[submission.submissionid] = submission.grade?.score || '';
          initialFeedback[submission.submissionid] = submission.grade?.feedback || '';
        });
        
        setGradeUpdates(initialGrades);
        setFeedbackUpdates(initialFeedback);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError("Failed to load submissions");
        toast.error("Could not load student submissions");
      } finally {
        setLoading(false);
      }
    };

    if (assignment) {
      fetchSubmissions();
    }
  }, [assignment, assnId]);

  const handleGradeChange = (submissionId, value) => {
    setGradeUpdates(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const handleFeedbackChange = (submissionId, value) => {
    setFeedbackUpdates(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const handleSaveGrade = async (submissionId) => {
    try {
      setSavingStates(prev => ({ ...prev, [submissionId]: true }));
      
      const payload = {
        submissionId,
        score: gradeUpdates[submissionId],
        feedback: feedbackUpdates[submissionId] || ""
      };

      const response = await axiosInstance.post(
        `/grades`,
        payload
      );

      // Update the submissions array with the new grade
      setSubmissions(prev => 
        prev.map(sub => 
          sub.submissionid === submissionId 
            ? {
                ...sub, 
                grade: {
                  ...sub.grade,
                  score: gradeUpdates[submissionId],
                  feedback: feedbackUpdates[submissionId],
                  gradedAt: new Date().toISOString()
                }
              } 
            : sub
        )
      );

      // Show success toast notification
      toast.success("Grade saved successfully", {
        description: `Updated grade for ${submissions.find(s => s.submissionid === submissionId)?.student_name}`
      });
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("Failed to save grade", {
        description: error.response?.data?.message || "Please try again later"
      });
    } finally {
      setSavingStates(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const toggleGradeRelease = async () => {
    try {
      const newState = !gradeReleased;
      setGradeReleased(newState);
      
      const response = await axiosInstance.put(
        `/assignments/${assnId}/toggle-grade-release`
      );
      
      // Show success toast
      if (newState) {
        toast.success("Grades are now visible to students");
      } else {
        toast.success("Grades are now hidden from students");
      }
    } catch (error) {
      console.error("Error toggling grade release:", error);
      // Revert state if there was an error
      setGradeReleased(!gradeReleased);
      toast.error("Failed to update grade visibility", {
        description: error.response?.data?.message || "Please try again later"
      });
    }
  };

  const openSubmission = (fileUrl) => {
    if (!fileUrl) {
      toast.error("No submission file available");
      return;
    }
    window.open(fileUrl, '_blank');
  };

  const handleViewResource = (resourceUrl) => {
    if (!resourceUrl) {
      toast.error("No resource file available");
      return;
    }
    window.open(resourceUrl, '_blank');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="mx-auto max-w-7xl">
        <CardHeader>
          <CardTitle className="text-xl"><Skeleton className="h-8 w-64" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 ml-auto" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mx-auto max-w-7xl">
        <CardContent className="p-6">
          <div className="text-red-500 flex items-center justify-center">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!assignment) {
    return (
      <Card className="mx-auto max-w-7xl">
        <CardContent className="p-6">
          <div className="text-red-500 flex items-center justify-center">
            <p>No assignment information found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <Card className="mx-auto max-w-7xl mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl font-semibold">{assignment.title}</CardTitle>
              <CardDescription className="mt-2 text-sm">
                {assignment.description || "No description provided"}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Grade Release</span>
              <Switch 
                checked={gradeReleased} 
                onCheckedChange={toggleGradeRelease} 
                aria-label="Toggle grade release"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Due: {formatDate(assignment.duedate)}</span>
            </div>
            <div className="flex items-center">
              <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Submissions: {submissions.length}</span>
            </div>
            <div className="flex items-center">
              <FileIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Max Points: {assignment.defaultgrade || "Not specified"}
              </span>
            </div>
          </div>
          
          {assignment.resources && (
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => handleViewResource(assignment.resources)}
              >
                <FileIcon className="h-4 w-4" />
                View Assignment Resource
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-7xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <FileIcon className="h-10 w-10 mb-2" />
              <p>No submissions found for this assignment</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grading</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.submissionid}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{submission.student_name?.charAt(0) || 'S'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{submission.student_name}</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="link" className="h-auto p-0 text-xs text-gray-500">
                                Details
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <span className="font-medium">Email:</span>
                                  <span className="col-span-2">{submission.student_email}</span>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                  <span className="font-medium">Submitted:</span>
                                  <span className="col-span-2">{formatDate(submission.submitteddate)}</span>
                                </div>
                                {submission.grade?.gradedAt && (
                                  <>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                      <span className="font-medium">Graded:</span>
                                      <span className="col-span-2">{formatDate(submission.grade.gradedAt)}</span>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                      <span className="font-medium">Graded By:</span>
                                      <span className="col-span-2">{submission.grade.gradedBy || "Unknown"}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={submission.grade?.score !== undefined ? "success" : "secondary"} className="flex items-center gap-1">
                        {submission.grade?.score !== undefined ? (
                          <CheckIcon className="h-3 w-3" />
                        ) : (
                          <ClockIcon className="h-3 w-3" />
                        )}
                        <span>
                          {submission.grade?.score !== undefined ? 'Graded' : 'Pending'}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {submission.grade ? `${submission.grade.score}/${assignment.defaultgrade || 100}` : 'Not graded'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 max-w-xs">
                        <Input
                          type="number"
                          min="0"
                          max={assignment.defaultgrade || 100}
                          className="w-24"
                          value={gradeUpdates[submission.submissionid] || ''}
                          onChange={(e) => handleGradeChange(submission.submissionid, e.target.value)}
                          placeholder="Score"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-24">
                              Feedback
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="space-y-2">
                              <h4 className="font-medium">Feedback</h4>
                              <Textarea
                                value={feedbackUpdates[submission.submissionid] || ''}
                                onChange={(e) => handleFeedbackChange(submission.submissionid, e.target.value)}
                                placeholder="Enter feedback for student"
                                className="min-h-[100px]"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSubmission(submission.fileUrl)}
                        >
                          View
                        </Button>
                        <Button
                          variant="primary" 
                          size="sm"
                          onClick={() => handleSaveGrade(submission.submissionid)}
                          disabled={savingStates[submission.submissionid]}
                        >
                          {savingStates[submission.submissionid] ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Submissions;