// src/components/courses/CourseLayout.jsx

import { useParams, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseLayout = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.endsWith("/people")
    ? "people"
    : location.pathname.endsWith("/materials")
    ? "materials"
    : "stream";

  const handleTabChange = (tab) => {
    const basePath = `/courses/${courseId}`;
    if (tab === "stream") navigate(basePath);
    else navigate(`${basePath}/${tab}`);
  };

  return (
    <div className="flex-row w-full h-full px-6 py-4">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="stream">Stream</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="animate-fadeIn">
        <Outlet />
      </div>
    </div>
  );
};

export default CourseLayout;