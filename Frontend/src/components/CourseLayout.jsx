import { useParams, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseLayout = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const className = location.state?.className || "Classroom";

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/people")) return "people";
    if (path.includes("/materials")) return "materials";
    if (path.includes("/assignments")) return "assignments";
    return "stream";
  };

  const currentTab = getActiveTab();
  const basePath = `/courses/${courseId}`;

  // Define default paths for each tab
  const tabPaths = {
    stream: basePath,
    materials: `${basePath}/materials`,
    assignments: `${basePath}/assignments`,
    people: `${basePath}/people`,
  };

  const handleTabChange = (tab) => {
    // Navigate to the default path of the clicked tab
    navigate(tabPaths[tab], { state: { className } });
  };

  return (
    <div className="w-full h-full px-6 py-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">{className}</h1>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="mb-6 w-full max-w-4xl">
        <div className="flex justify-center">
          <TabsList className="bg-white shadow-sm w-full max-w-xl justify-center">
            {["stream", "materials", "assignments", "people"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                onClick={() => handleTabChange(tab)} // Ensure clicking always navigates back to default path
                className={`transition-colors duration-200 px-4 py-2 rounded ${
                  currentTab === tab
                    ? "font-bold" // Darker background for active tab
                    : "text-black hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <div className="animate-fadeIn w-full max-w-6xl">
        <Outlet />
      </div>
    </div>
  );
};

export default CourseLayout;