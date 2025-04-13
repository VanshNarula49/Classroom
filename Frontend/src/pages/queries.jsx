import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Define API constants
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [queryResults, setQueryResults] = useState([]);
  const [queryParams, setQueryParams] = useState({
    courseId: "",
    assignmentId: "",
    userId: "",
  });
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState("");

  // Handle form input changes
  const handleInputChange = (e) => {
    setQueryParams({
      ...queryParams,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch and execute queries
  const executeQuery = async (queryNumber) => {
    setLoading(true);

    try {
      let response;

      switch (queryNumber) {
        case 1:
          response = await axiosInstance.post(`${API_URL}/api/queries/1`, {
            courseId: queryParams.courseId,
          });
          setQueryResults(response.data.data);
          break;

        case 2:
          response = await axiosInstance.post(`${API_URL}/api/queries/2`, {
            courseId: queryParams.courseId,
          });
          setQueryResults(response.data.data);
          if (response.data.course_name) {
            setCourseName(response.data.course_name);
          }
          break;

        case 3:
          response = await axiosInstance.post(`${API_URL}/api/queries/3`, {
            assignmentId: queryParams.assignmentId,
          });
          setQueryResults(response.data.data);
          break;

        case 4:
          response = await axiosInstance.post(`${API_URL}/api/queries/4`, {
            courseId: queryParams.courseId,
          });
          setQueryResults(response.data.data);
          break;

        case 5:
          response = await axiosInstance.post(`${API_URL}/api/queries/5`, {
            courseId: queryParams.courseId || undefined,
          });
          setQueryResults(response.data.data);
          break;

        case 6:
          response = await axiosInstance.post(`${API_URL}/api/queries/6`, {
            userId: queryParams.userId,
          });
          setQueryResults(response.data.data);
          break;

        case 7:
          response = await axiosInstance.post(`${API_URL}/api/queries/7`, {
            courseId: queryParams.courseId || undefined,
          });
          setQueryResults(response.data.data);
          break;

        case 8:
          response = await axiosInstance.post(`${API_URL}/api/queries/8`, {
            userId: queryParams.userId || undefined,
          });
          setQueryResults(response.data.data);
          break;

        case 9:
          response = await axiosInstance.post(`${API_URL}/api/queries/9`);
          setQueryResults(response.data.data);
          break;

        case 10:
          response = await axiosInstance.post(`${API_URL}/api/queries/10`);
          setQueryResults(response.data.data);
          break;

        default:
          toast.error("Invalid query selection");
          return;
      }

      setCurrentPage(`results${queryNumber}`);
    } catch (err) {
      toast.error(
        <div align="left">
          <strong>
            {err.response?.data?.message ||
              `Failed to execute Query ${queryNumber}`}
          </strong>
          <br />
          {err.response?.data?.details || "Could not connect to the server"}
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // Navigate back to home
  const goBack = () => {
    setCurrentPage("home");
  };

  // Render based on current page
  if (currentPage === "home") {
    return (
      <QueryInputPage
        executeQuery={executeQuery}
        queryParams={queryParams}
        handleInputChange={handleInputChange}
        loading={loading}
      />
    );
  } else {
    return (
      <ResultsPage
        queryNumber={currentPage.replace("results", "")}
        data={queryResults}
        goBack={goBack}
        loading={loading}
        courseName={courseName}
      />
    );
  }
}

// Input Form Page Component
function QueryInputPage({ executeQuery, queryParams, handleInputChange, loading }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">LMS Query System</h1>

      <div className="space-y-8">
        {/* Query Buttons */}
        {[...Array(10).keys()].map((index) => (
          <div key={index} className="p-4 border rounded">
            <h2 className="font-bold">Execute Query {index + 1}</h2>
            {index + 1 <= 8 && (
              <div className="mt-2">
                <label className="block mb-1">
                  {index + 1 === 3
                    ? "Assignment ID:"
                    : index + 1 === 6 || index + 1 === 8
                    ? "User ID:"
                    : "Course ID:"}
                </label>
                <input
                  type="number"
                  name={
                    index + 1 === 3
                      ? "assignmentId"
                      : index + 1 === 6 || index + 1 === 8
                      ? "userId"
                      : "courseId"
                  }
                  value={
                    index + 1 === 3
                      ? queryParams.assignmentId
                      : index + 1 === 6 || index + 1 === 8
                      ? queryParams.userId
                      : queryParams.courseId
                  }
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-2"
                />
              </div>
            )}
            <button
              onClick={() => executeQuery(index + 1)}
              className="bg-black text-white px-4 py-2 rounded"
              disabled={
                loading ||
                ((index + 1 <= 8 &&
                  !queryParams[
                    index + 1 === 3
                      ? "assignmentId"
                      : index + 1 === 6 || index + 1 === 8
                      ? "userId"
                      : "courseId"
                  ]) ||
                  false)
              }
            >
              {loading ? "Loading..." : `Execute Query ${index + 1}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Results Page Component
function ResultsPage({ queryNumber, data, goBack, loading, courseName }) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-4">
          <button onClick={goBack} className="flex items-center text-blue-500">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Queries
          </button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Results for Query {queryNumber}</h1>
        {courseName && <h2 className="text-xl mb-4">Course: {courseName}</h2>}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading results...</p>
          </div>
        ) : data && data.length > 0 ? (
          <ResultsTable queryNumber={queryNumber} data={data} />
        ) : (
          <p>No results found.</p>
        )}
      </div>
    );
}