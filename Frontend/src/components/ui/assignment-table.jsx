import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const AssignmentTable = ({ assignments }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[35%]">Title</TableHead>
          <TableHead className="w-[20%]">Created By</TableHead>
          <TableHead className="w-[20%]">Due Date</TableHead>
          <TableHead className="w-[10%]">Status</TableHead>
          <TableHead className="text-right w-[15%]">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.assignmentid}>
            <TableCell>{assignment.title}</TableCell>
            <TableCell>{assignment.creator_name}</TableCell>
            <TableCell>{new Date(assignment.duedate).toLocaleDateString()}</TableCell>
            <TableCell>{assignment.status || "Not submitted"}</TableCell>
            <TableCell className="text-right">
              <Link 
                to={`${assignment.assignmentid}`} 
                state={{ assignment: assignment }}
              >
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssignmentTable;