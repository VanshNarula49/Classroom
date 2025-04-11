// src/components/courses/MaterialCard.jsx

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const MaterialCard = ({ material }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { title, createdby, createdat, filepath } = material;

  const formattedDate = new Date(createdat).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      onClick={() => window.open(filepath, "_blank")}
      className={`w-full mb-5 cursor-pointer transition-all duration-500 border-gray-100 hover:border-gray-400 group 
                  ${isHovered ? "bg-black text-white" : "bg-white text-black"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-5 pb-1">
        <p className={`text-xs font-sans mb-1 ${isHovered ? "text-gray-400" : "text-gray-500"}`}>
          Uploaded on {formattedDate}
        </p>
        <h3
          className={`text-lg font-semibold leading-snug truncate ${
            isHovered ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p className={`text-sm mt-2 ${isHovered ? "text-gray-300" : "text-gray-700"}`}>
          {createdby}
        </p>
      </CardContent>

      <CardFooter className="pb-4 pt-1">
        <div
          className={`w-full flex justify-end items-center text-xs font-sans transition-colors duration-300 ${
            isHovered ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>View</span>
          <ChevronRight size={14} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default MaterialCard;