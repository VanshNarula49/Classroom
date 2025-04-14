import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronRight, BookOpen } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

export function ClassroomCard({ name, courseCode, professor, role, id }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let typingTimer;

    if (isHovered) {
      setIsTyping(true);
      setDisplayedText("");
      setIsAnimating(true);

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
      
      // Delay resetting animation state for smooth transition out
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }

    return () => clearInterval(typingTimer);
  }, [isHovered, name]);

  return (
    <Card 
      onClick={() => navigate(`/courses/${id}`, { state: { className: name } })}
      className={cn(
        "min-w-xs w-full max-w-md border rounded-xl overflow-hidden group cursor-pointer transition-all duration-500",
        "hover:shadow-xl",
        isHovered ? 'scale-[1.02]' : 'scale-100',
        "dark:hover:border-gray-600",
        isHovered ? 'bg-black text-white' : 'bg-card'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-6 relative z-10">
        <div className="mb-2 overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <p className={cn(
              "text-xs font-medium px-2 py-1 rounded-full transition-colors duration-300 flex items-center gap-1",
              isHovered ? 'bg-white/10 text-gray-300' : 'bg-black/5 text-gray-600'
            )}>
              <BookOpen size={12} className={cn(
                "transition-all duration-300",
                isAnimating ? "rotate-12" : ""
              )} />
              {courseCode}
            </p>
            
            <div className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-500",
              isHovered ? "bg-primary" : "bg-gray-300",
              isAnimating ? "scale-150" : ""
            )} />
          </div>
          
          <div className="overflow-hidden h-24 flex items-center">
            <h3 className={cn(
              "font-sans text-3xl font-medium tracking-tight transition-all duration-500",
              isHovered ? 'text-white' : 'text-gray-900'
            )}>
              {displayedText}
              {isTyping && (
                <span className="inline-block w-1 h-6 ml-1 bg-current animate-pulse"></span>
              )}
            </h3>
          </div>
          
          <div className={cn(
            "border-t pt-4 transition-all duration-500",
            isHovered ? 'border-gray-700' : 'border-gray-200'
          )}>
            <div className={cn(
              "flex justify-between items-end text-sm transition-colors",
              isHovered ? 'text-gray-300' : 'text-gray-700'
            )}>
              <div>
                <p className="font-medium">{professor}</p>
                <p className={cn(
                  "text-xs mt-1 px-2 py-0.5 rounded-full inline-block transition-all duration-300",
                  role === "Professor" 
                    ? (isHovered ? "bg-primary/20 text-primary-foreground" : "bg-primary/10 text-primary") 
                    : role === "TA" || role === "teachingAssistant"
                    ? (isHovered ? "bg-amber-500/20 text-amber-200" : "bg-amber-500/10 text-amber-600")
                    : (isHovered ? "bg-gray-500/20 text-gray-300" : "bg-gray-200 text-gray-600")
                )}>
                  {role}
                </p>
              </div>
              
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform",
                isHovered ? "bg-primary text-white translate-y-0" : "bg-transparent text-gray-400 translate-y-8"
              )}>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className={cn(
        "pb-4 transition-all duration-500", 
        isHovered ? "opacity-0" : "opacity-100"
      )}>
        <button className="w-full flex justify-end items-center py-2 text-xs font-sans text-gray-500 hover:text-gray-900">
          <span>View details</span>
          <ChevronRight size={14} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </CardFooter>
    </Card>
  );
}