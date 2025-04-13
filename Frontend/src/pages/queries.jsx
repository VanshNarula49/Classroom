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
  const [coursename, setCourseName] = useState("");

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
            userId: queryParams.userid || undefined,
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
            userId: queryParams.userid || undefined,
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
        coursename={coursename}
      />
    );
  }
}

// Input Form Page Component
function QueryInputPage({ executeQuery, queryParams, handleInputChange, loading }) {
  return (
    <div className="max-w-4xl mx-auto p-6">

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
                      ? "userid"
                      : "courseId"
                  }
                  value={
                    index + 1 === 3
                      ? queryParams.assignmentId
                      : index + 1 === 6 || index + 1 === 8
                      ? queryParams.userid
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
                      ? "userid"
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
function ResultsPage({ queryNumber, data, goBack, loading, coursename }) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-4">
          <button onClick={goBack} className="flex items-center text-blue-500">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Queries
          </button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Results for Query {queryNumber}</h1>
        {coursename && <h2 className="text-xl mb-4">Course: {coursename}</h2>}
        
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

function ResultsTable({ queryNumber, data }) {
    // Different tables based on query number
    switch (queryNumber) {
      case "1":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">User ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Course Name</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.userid}</td>
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2">{item.email}</td>
                    <td className="border p-2">{item.coursename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "2":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Material ID</th>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">File Path</th>
                  <th className="border p-2">Posted By</th>
                  <th className="border p-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.materialid}</td>
                    <td className="border p-2">{item.materialtitle || item.title}</td>
                    <td className="border p-2">{item.materialtype || item.type}</td>
                    <td className="border p-2">{item.description}</td>
                    <td className="border p-2">{item.filepath}</td>
                    <td className="border p-2">{item.postedby || item.createdBy}</td>
                    <td className="border p-2">{item.createdat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "3":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Comment ID</th>
                  <th className="border p-2">Content</th>
                  <th className="border p-2">Posted At</th>
                  <th className="border p-2">Commenter</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.commentid}</td>
                    <td className="border p-2">{item.content}</td>
                    <td className="border p-2">{item.postedat}</td>
                    <td className="border p-2">{item.commenter || item.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "4":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Announcement ID</th>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Content</th>
                  <th className="border p-2">Created At</th>
                  <th className="border p-2">Instructor Name</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.announcementid}</td>
                    <td className="border p-2">{item.title}</td>
                    <td className="border p-2">{item.content}</td>
                    <td className="border p-2">{item.createdat}</td>
                    <td className="border p-2">{item.instructorname}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "5":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Submission ID</th>
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">Course Name</th>
                  <th className="border p-2">Assignment Title</th>
                  <th className="border p-2">Submitted Date</th>
                  <th className="border p-2">Due Date</th>
                  <th className="border p-2">Days Late</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.submissionid}</td>
                    <td className="border p-2">{item.studentname}</td>
                    <td className="border p-2">{item.coursename}</td>
                    <td className="border p-2">{item.assignmenttitle}</td>
                    <td className="border p-2">{item.submitteddate}</td>
                    <td className="border p-2">{item.duedate}</td>
                    <td className="border p-2">{item.dayslate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "6":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Course Name</th>
                  <th className="border p-2">Average Grade</th>
                  <th className="border p-2">Total Assignments</th>
                  <th className="border p-2">Completed Assignments</th>
                  <th className="border p-2">Missing Assignments</th>
                  <th className="border p-2">Late Submissions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.coursename}</td>
                    <td className="border p-2">{item.averagegrade}</td>
                    <td className="border p-2">{item.totalassignments}</td>
                    <td className="border p-2">{item.completedassignments}</td>
                    <td className="border p-2">{item.missingassignments}</td>
                    <td className="border p-2">{item.latesubmissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "7":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Assignment Title</th>
                  <th className="border p-2">Course Name</th>
                  <th className="border p-2">Number of Submissions</th>
                  <th className="border p-2">Average Score</th>
                  <th className="border p-2">Min Score</th>
                  <th className="border p-2">Max Score</th>
                  <th className="border p-2">Score Range</th>
                  <th className="border p-2">Fail Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.assignmenttitle}</td>
                    <td className="border p-2">{item.coursename}</td>
                    <td className="border p-2">{item.numberofsubmissions}</td>
                    <td className="border p-2">{item.averagescore}</td>
                    <td className="border p-2">{item.minscore}</td>
                    <td className="border p-2">{item.maxscore}</td>
                    <td className="border p-2">{item.scorerange}</td>
                    <td className="border p-2">{item.failrate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "8":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">User ID</th>
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">Course ID</th>
                  <th className="border p-2">Course Name</th>
                  <th className="border p-2">Total Assignments</th>
                  <th className="border p-2">Completed Assignments</th>
                  <th className="border p-2">Completion Rate (%)</th>
                  <th className="border p-2">Average Score</th>
                  <th className="border p-2">Late Submissions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.userid}</td>
                    <td className="border p-2">{item.studentname}</td>
                    <td className="border p-2">{item.courseid}</td>
                    <td className="border p-2">{item.coursename}</td>
                    <td className="border p-2">{item.totalassignments}</td>
                    <td className="border p-2">{item.completedassignments}</td>
                    <td className="border p-2">{item.completionrate}</td>
                    <td className="border p-2">{item.averagescore}</td>
                    <td className="border p-2">{item.latesubmissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "9":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Course ID</th>
                  <th className="border p-2">Course Name</th>
                  <th className="border p-2">Total Grades</th>
                  <th className="border p-2">Average Score</th>
                  <th className="border p-2">A (%)</th>
                  <th className="border p-2">B (%)</th>
                  <th className="border p-2">C (%)</th>
                  <th className="border p-2">D (%)</th>
                  <th className="border p-2">E (%)</th>
                  <th className="border p-2">F (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.courseid}</td>
                    <td className="border p-2">{item.coursename}</td>
                    <td className="border p-2">{item.totalgrades}</td>
                    <td className="border p-2">{item.averagescore}</td>
                    <td className="border p-2">{item.apercentage}</td>
                    <td className="border p-2">{item.bpercentage}</td>
                    <td className="border p-2">{item.cpercentage}</td>
                    <td className="border p-2">{item.dpercentage}</td>
                    <td className="border p-2">{item.epercentage}</td>
                    <td className="border p-2">{item.fpercentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "10":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">User ID</th>
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">Course ID</th>
                  <th className="border p-2">Course Name</th>
                  <th className="border p-2">Total Assignments</th>
                  <th className="border p-2">Completed Assignments</th>
                  <th className="border p-2">Completion Rate (%)</th>
                  <th className="border p-2">Average Score</th>
                  <th className="border p-2">Late Submissions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.userid}</td>
                    <td className="border p-2">{item.studentname}</td>
                    <td className="border p-2">{item.courseid}</td>
                    <td className="border p-2">{item.coursename}</td>
                    <td className="border p-2">{item.totalassignments}</td>
                    <td className="border p-2">{item.completedassignments}</td>
                    <td className="border p-2">{item.completionrate}</td>
                    <td className="border p-2">{item.averagescore}</td>
                    <td className="border p-2">{item.latesubmissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return <p>No results table defined for this query.</p>;
    }
}