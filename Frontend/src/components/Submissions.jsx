import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Submissions = () => {
  const { assignmentid } = useParams();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_URL}/api/submissions/assignment/1/all`
        );
        console.log("Submissions API Response:", response);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, [assignmentid]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Submissions for Assignment {assignmentid}</h2>
      {/* Render UI here later */}
    </div>
  );
};

export default Submissions;