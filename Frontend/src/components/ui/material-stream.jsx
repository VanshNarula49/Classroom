import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, 
  FileText, 
  Book, 
  FileIcon, 
  CalendarIcon,
  DownloadIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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

    // Get appropriate icon based on material type
    const getTypeIcon = () => {
        switch(type?.toLowerCase()) {
            case 'pdf':
            case 'document':
                return <FileText size={18} className="text-gray-800" />;
            case 'lecture':
                return <Book size={18} className="text-gray-800" />;
            default:
                return <FileIcon size={18} className="text-gray-800" />;
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
        >
            <Card 
                className="w-full overflow-hidden border-l-4 border-l-gray-800 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleCardClick}
            >
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2.5 rounded-full mt-1 flex-shrink-0">
                            {getTypeIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-medium text-base text-gray-900 leading-tight truncate">{title}</h3>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <CalendarIcon size={12} className="text-gray-400" />
                                    <p className="text-xs text-gray-400">{createdAt}</p>
                                </div>
                            </div>
                            
                            {description && (
                                <p className="text-sm text-gray-600 line-clamp-1 mb-2">{description}</p>
                            )}
                            
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div className="flex items-center flex-wrap gap-2">
                                    <p className="text-sm text-gray-600 truncate">{createdBy}</p>
                                    <Badge variant="outline" className="font-normal bg-gray-50">
                                        {type || "Material"}
                                    </Badge>
                                </div>
                                <motion.div 
                                    className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-300"
                                    animate={{ x: isHovered ? 3 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span>View details</span>
                                    <ChevronRight size={14} className="ml-1" />
                                    
                                    {filepath && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8, x: -5 }}
                                            animate={{ 
                                                opacity: isHovered ? 1 : 0,
                                                scale: isHovered ? 1 : 0.8,
                                                x: isHovered ? 0 : -5
                                            }}
                                            className="ml-3 flex items-center"
                                        >
                                            <DownloadIcon size={14} className="mr-1" />
                                            <span>Download</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default MaterialCard;