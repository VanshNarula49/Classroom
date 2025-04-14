import { Link, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AssignmentTable = ({ assignments }) => {
  const [userRole, setUserRole] = useState(null);
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/api/courses/${courseId}/role`);
        console.log("API Response:", response);
        setUserRole(response.data.data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [courseId]);

  return (
    <Table className="table-fixed w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Title</TableHead>
          <TableHead className="text-center">Created By</TableHead>
          <TableHead className="text-center">Due Date</TableHead>
          <TableHead className="text-center">Action</TableHead>
          {userRole && userRole !== "Student" && (
            <TableHead className="text-center">Submissions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.assignmentid}>
            <TableCell className="text-center">{assignment.title}</TableCell>
            <TableCell className="text-center">{assignment.creator_name}</TableCell>
            <TableCell className="text-center">
              {new Date(assignment.duedate).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-center">
              <Link to={`${assignment.assignmentid}`} state={{ assignment }}>
                <Button size="sm">View</Button>
              </Link>
            </TableCell>
            {userRole && userRole !== "Student" && (
              <TableCell className="text-center">
                <Link to={`${assignment.assignmentid}/submissions`}>
                  <Button variant="outline" size="sm">View Submissions</Button>
                </Link>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssignmentTable;