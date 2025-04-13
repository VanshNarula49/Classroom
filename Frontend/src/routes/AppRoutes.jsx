import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import AuthTabs from "@/components/AuthTabs";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import AnotherPage from "../components/AnotherPage";
import CourseLayout from "@/components/CourseLayout";
import CourseStream from "@/components/CourseStream";
import CoursePeople from "@/components/CoursePeople";
import CourseMaterial from "@/components/CourseMaterial";
import MaterialDetail from "@/components/Material";
import CourseAssignment from "@/components/CourseAssignments";
import Assignment from "@/components/Assignment";
import App from "@/pages/queries";
import AnnouncementDetail from "@/components/Announcement";

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

        <Route path="/courses/:courseId" element={<CourseLayout />}>
              <Route index element={<CourseStream />} />
              <Route path="people" element={<CoursePeople />} />
              <Route path="materials" element={<CourseMaterial />} />
              <Route path="materials/:materialId" element={<MaterialDetail />} />
              <Route path="assignments" element={<CourseAssignment />} />
              <Route path="assignments/:assignmentId" element={<Assignment />} />
              <Route path="announcements/:announcementId" element={<AnnouncementDetail />} />

        </Route>

        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
        <Route path="/queries" element={<App />} />
      </Route>
    )}
  </Routes>
</BrowserRouter>
  );
};

export default AppRoutes;