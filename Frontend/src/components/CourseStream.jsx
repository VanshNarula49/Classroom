import MaterialCard from "./ui/material-stream";
import AssignmentCard from "./ui/assignment-stream";
import AnnouncementCard from "./ui/announcement-stream";

export default function StreamCards() {
    return (
        <div className="flex flex-col space-y-3 w-full mx-auto p-4">
          
          {/* Announcement Card */}
          <AnnouncementCard 
            title="Important: Final Project Guidelines"
            createdBy="Prof. Johnson"
            createdAt="April 10, 2025"
          />
          
          {/* Assignment Card */}
          <AssignmentCard 
            title="Homework 7: React Components"
            createdBy="Prof. Johnson"
            createdAt="April 8, 2025"
            dueDate="April 18, 2025"
          />
          
          {/* Material Card */}
          <MaterialCard
            title="Lecture Notes: UI Component Design"
            createdBy="Prof. Johnson" 
            createdAt="April 5, 2025"
            type="PDF"
          />
        </div>
      );
    }