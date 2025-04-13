import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function ClassroomCard({ name, courseCode, professor, role, id }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let typingTimer;

    if (isHovered) {
      setIsTyping(true);
      setDisplayedText("");

      let index = 0;
      typingTimer = setInterval(() => {
        if (index <= name.length) {
          setDisplayedText(name.slice(0, index));
          index++;
        } else {
          clearInterval(typingTimer);
          setIsTyping(false);
        }
      }, 70);
    } else {
      clearInterval(typingTimer);
      setDisplayedText(name);
      setIsTyping(false);
    }

    return () => clearInterval(typingTimer);
  }, [isHovered, name]);

  return (
    <Card 
      onClick={() => navigate(`/courses/${id}`, { state: { className: name } })}
      className={`min-w-xs w-full max-w-md transition-all duration-500 border-gray-100 hover:border-gray-400 group cursor-pointer
                 ${isHovered ? 'bg-black text-white' : 'bg-white text-black'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-6">
        <div className="mb-6 overflow-hidden">
          <p className={`text-xs font-sans font-medium mb-1 transition-colors duration-300
                        ${isHovered ? 'text-gray-400' : 'text-gray-500'}`}>
            {courseCode}
          </p>
          <div className="overflow-hidden h-24">
            <h3 className={`font-sans text-3xl font-medium mb-6 tracking-tight transition-colors duration-300
                          ${isHovered ? 'text-white' : 'text-gray-900'}`}>
              {displayedText}
              {isTyping && <span className="inline-block w-1 h-6 ml-1 bg-current animate-pulse"></span>}
            </h3>
          </div>
          <div className={`border-t pt-4 transition-colors duration-300 animate-soft-fade-in
                        ${isHovered ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className={`text-sm transition-colors ${isHovered ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">{professor}</p>
              <p className="text-xs">You are a {role}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pb-4">
        <button 
          className={`w-full flex justify-end items-center py-2 text-xs font-sans transition-colors duration-300
                    ${isHovered ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <span>View details</span>
          <ChevronRight size={14} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </CardFooter>
    </Card>
  );
}