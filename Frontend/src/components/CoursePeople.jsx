import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
const API_URL = "http://localhost:3000";
import { toast, Toaster } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CoursePeople = () => {
    const { courseId } = useParams();
    const [people, setPeople] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
  
    useEffect(() => {
      const fetchCoursePeople = async () => {
        try {
          const res = await axiosInstance.get(`${API_URL}/api/courses/${courseId}`);
          setPeople(res.data.data);
        } catch (err) {
          toast.error(
            <div align="left">
              <strong>{err.response?.data?.message || "Failed to load people"}</strong>
              <br />
              {err.response?.data?.details || "Could not connect to the server"}
            </div>
          );
        } finally {
          setLoading(false);
        }
      };
  
      fetchCoursePeople();
    }, [courseId]);
  
    const filterPeople = (list) =>
      list.filter((name) => name.toLowerCase().includes(search.toLowerCase()));
  
    const renderPersonList = (list) =>
      filterPeople(list).map((name, index) => (
        <div key={index} className="flex items-center gap-3 py-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{name}</span>
        </div>
      ));
  
    return (
      <div className="w-full h-screen p-6 overflow-auto bg-background box-border">
        <Toaster position="top-right" richColors />
  
        {loading ? (
          <p className="text-center text-gray-500">Loading people...</p>
        ) : (
          <div className="flex flex-col h-full w-full">
            <Card className="max-w-full flex-grow">
              <CardHeader className="flex flex-row justify-between items-center gap-4 flex-wrap">
                <CardTitle className="text-2xl">Course Members</CardTitle>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search people..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
  
              <CardContent className="h-full overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {/* Professors */}
                  <div className="w-full">
                    <h3 className="text-lg font-semibold mb-2">Professors</h3>
                    {renderPersonList(people.professornames)}
                  </div>
  
                  {/* TAs */}
                  <div className="w-full">
                    <h3 className="text-lg font-semibold mb-2">Teaching Assistants</h3>
                    {renderPersonList(people.tanames)}
                  </div>
  
                  {/* Students */}
                  <div className="w-full">
                    <h3 className="text-lg font-semibold mb-2">Students</h3>
                    {renderPersonList(people.enrolledstudentnames)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };
  
export default CoursePeople;
