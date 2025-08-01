import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, MessageSquare } from "lucide-react";

function AnnouncementCard({ id, title, createdBy, createdAt, content }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const { courseId } = useParams();
    
    const handleCardClick = () => {
        // Create announcement data object to pass via state
        const announcementData = {
            id,
            title,
            createdBy,
            createdAt,
            content
        };
        
        // Navigate to announcement detail page with absolute path
        navigate(`/courses/${courseId}/announcements/${id}`, { 
            state: { announcement: announcementData } 
        });
    };
    
    return (
        <Card 
            className="w-full border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
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
                            <div 
                                className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-300"
                            >
                                <span>View details</span>
                                <ChevronRight size={14} className={`ml-1 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default AnnouncementCard;