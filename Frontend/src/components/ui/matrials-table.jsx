// src/components/courses/MaterialTable.jsx
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
  
  const MaterialTable = ({ materials }) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead className="w-[25%]">Uploaded By</TableHead>
            <TableHead className="w-[20%]">Date</TableHead>
            <TableHead className="text-right w-[15%]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id}>
              <TableCell>{material.title}</TableCell>
              <TableCell>{material.createdby}</TableCell>
              <TableCell>{new Date(material.createdat).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Link to={`/materials/${material.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
export default MaterialTable;  