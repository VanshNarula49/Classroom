import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import AuthTabs from "@/components/AuthTabs";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import AnotherPage from "../components/AnotherPage";

// import Courses from "@/components/courses/Courses";
// import CourseStream from "@/components/courses/CourseStream";
// import CoursePeople from "@/components/courses/CoursePeople";
// import CourseMaterial from "@/components/courses/CourseMaterial";

const AppRoutes = () => {
  const { token } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/auth" element={<AuthTabs />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/another" element={<AnotherPage />} />

            {/* Courses listing */}
            {/* <Route path="/courses" element={<Courses />} /> */}

            {/* Course details with nested layout */}
            <Route path="/courses/:courseId" element={<AnotherPage />}>
              {/* <Route path="people" element={<CoursePeople />} />
              <Route path="materials" element={<CourseMaterial />} /> */}
            </Route>

            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;