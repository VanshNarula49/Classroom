// import { useParams, Outlet, useLocation, useNavigate } from "react-router-dom";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// const CourseLayout = () => {
//   const { courseId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const currentTab = location.pathname.includes("/people")
//     ? "people"
//     : location.pathname.includes("/materials")
//     ? "materials"
//     : "stream";

//   const handleTabChange = (tab) => {
//     const basePath = `/courses/${courseId}`;
//     if (tab === "stream") navigate(basePath);
//     else navigate(`${basePath}/${tab}`);
//   };

//   return (
//     <div className="w-full h-full px-6 py-4 flex flex-col items-center">
//       <Tabs
//         value={currentTab}
//         onValueChange={handleTabChange}
//         className="mb-6 w-full max-w-4xl"
//       >
//         <div className="flex justify-center">
//           <TabsList className="bg-white shadow-sm w-full max-w-xl justify-center">
//             <TabsTrigger value="stream">Stream</TabsTrigger>
//             <TabsTrigger value="materials">Materials</TabsTrigger>
//             <TabsTrigger value="people">People</TabsTrigger>
//           </TabsList>
//         </div>
//       </Tabs>

//       <div className="animate-fadeIn w-full max-w-6xl">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default CourseLayout;
import { useParams, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseLayout = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Improved tab detection logic to handle nested routes
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/people")) return "people";
    if (path.includes("/materials")) return "materials";
    if (path.includes("/assignments")) return "assignments";
    return "stream";
  };

  const currentTab = getActiveTab();

  const handleTabChange = (tab) => {
    const basePath = `/courses/${courseId}`;
    if (tab === "stream") navigate(basePath);
    else navigate(`${basePath}/${tab}`);
  };

  return (
    <div className="w-full h-full px-6 py-4 flex flex-col items-center">
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="mb-6 w-full max-w-4xl"
      >
        <div className="flex justify-center">
          <TabsList className="bg-white shadow-sm w-full max-w-xl justify-center">
            <TabsTrigger value="stream">Stream</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
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