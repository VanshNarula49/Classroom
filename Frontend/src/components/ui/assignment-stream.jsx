import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, 
  FileText, 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  ArrowRightIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

function AssignmentCard({id, title, createdBy, createdAt, dueDate, item }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Pass the item as 'assignment' in the state to match what the Assignment component expects
    navigate(`assignments/${id}`, {state: {assignment: item}});
  };

  // Calculate if assignment is due soon (within 48 hours)
  const isDueSoon = () => {
    if (!dueDate) return false;
    const dueDateObj = new Date(dueDate);
    const now = new Date();
    const diffTime = dueDateObj - now;
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours > 0 && diffHours < 48;
  };

  // Calculate if assignment is overdue
  const isOverdue = () => {
    if (!dueDate) return false;
    const dueDateObj = new Date(dueDate);
    const now = new Date();
    return dueDateObj < now;
  };

  // Get badge variant based on due status
  const getDueBadgeVariant = () => {
    if (isOverdue()) return "outline";
    if (isDueSoon()) return "secondary";
    return "outline";
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
              <FileText size={18} className="text-gray-800" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-medium text-base text-gray-900 leading-tight truncate">{title}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <CalendarIcon size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-400">{createdAt}</p>
                </div>
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-1 mb-2">{item.description}</p>
              )}
              
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center flex-wrap gap-3">
                  <div className="flex items-center gap-1">
                    <UserIcon size={12} className="text-gray-500" />
                    <p className="text-sm text-gray-600 truncate">{createdBy}</p>
                  </div>
                  
                  {dueDate && (
                    <div className="flex items-center gap-1">
                      <ClockIcon size={12} className="text-gray-500" />
                      <Badge variant={getDueBadgeVariant()} className="font-normal text-xs">
                        {isOverdue() ? "Overdue" : isDueSoon() ? "Due soon" : "Due"}: {dueDate}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <motion.div 
                  className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-300"
                  animate={{ x: isHovered ? 3 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="whitespace-nowrap">View assignment</span>
                  <motion.div
                    animate={{ 
                      x: isHovered ? 3 : 0,
                      opacity: isHovered ? 1 : 0.7
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRightIcon size={14} className="ml-1" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AssignmentCard;