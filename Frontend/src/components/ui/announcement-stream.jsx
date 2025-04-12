import React from 'react'
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronRight, FileText, Book, MessageSquare } from "lucide-react";

function AnnouncementCard({ title, courseId, createdBy, createdAt }) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <Card 
        className={`w-full border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="py-3">
          <div className="flex items-start">
            <div className="bg-gray-100 p-1.5 rounded-full mr-3">
              <MessageSquare size={18} className="text-gray-800" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-base">{title}</h3>
                <p className="text-xs text-gray-400 ml-2">{createdAt}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{createdBy}</p>
                <button 
                  className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-300"
                >
                  <span>View details</span>
                  <ChevronRight size={14} className={`ml-1 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

export default AnnouncementCard