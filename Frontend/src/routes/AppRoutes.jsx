import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import AuthTabs from "@/components/AuthTabs";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import AnotherPage from "../components/AnotherPage";

// import Courses from "@/components/courses/Courses";
import CourseStream from "@/components/CourseStream";
import CoursePeople from "@/components/CoursePeople";
import CourseMaterial from "@/components/CourseMaterial";

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

        {/* Standalone course routes */}
        <Route path="/courses/:courseId" element={<CourseStream />} />
        <Route path="/courses/:courseId/people" element={<CoursePeople />} />
        <Route path="/courses/:courseId/materials" element={<CourseMaterial />} />

        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
    )}
  </Routes>
</BrowserRouter>
  );
};

export default AppRoutes;