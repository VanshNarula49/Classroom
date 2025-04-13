import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Book } from "lucide-react";

function MaterialCard({ id, title, createdBy, createdAt, type, description, filepath }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    
    const handleCardClick = () => {
        // Create a material object with all necessary properties
        const materialData = {
            id,
            title,
            creator_name: createdBy,
            createdat: new Date(createdAt),
            material_type: type,
            description,
            filepath
        };
        
        // Navigate to material detail page with the material data
        navigate(`materials/${id}`, { state: { material: materialData } });
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
                        <Book size={18} className="text-gray-800" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium text-base">{title}</h3>
                            <p className="text-xs text-gray-400 ml-2">{createdAt}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <p className="text-sm text-gray-600 mr-3">{createdBy}</p>
                                <p className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{type}</p>
                            </div>
                            <button
                                className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-300"
                            >
                                <span>View details</span>
                                <ChevronRight 
                                    size={14} 
                                    className={`ml-1 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default MaterialCard;