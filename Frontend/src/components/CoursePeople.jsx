import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import { toast, Toaster } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserMinus, User, Users } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const initials = (name) => {
  return name
      ? name.split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
      : "??";
};

const CoursePeople = () => {
    const { courseId } = useParams();
    const [people, setPeople] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updatingRole, setUpdatingRole] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Fetch course details
          const courseRes = await axiosInstance.get(`${API_URL}/api/courses/${courseId}`);
          
          // Transform course data
          const courseData = courseRes.data.data;
          const transformedData = {
            professors: courseData.professors
              .map(p => ({ id: p.id, name: p.name, email: p.email }))
              .sort((a, b) => a.name.localeCompare(b.name)),
            teachingAssistants: courseData.teachingAssistants
              .map(ta => ({ id: ta.id, name: ta.name, email: ta.email }))
              .sort((a, b) => a.name.localeCompare(b.name)),
            students: courseData.students
              .map(s => ({ id: s.id, name: s.name, email: s.email }))
              .sort((a, b) => a.name.localeCompare(b.name))
          };
          
          setPeople(transformedData);
          
          // Fetch user role
          const roleRes = await axiosInstance.get(`${API_URL}/api/courses/${courseId}/role`);
          setUserRole(roleRes.data.data.role);
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
  
      fetchData();
    }, [courseId]);
    
    const handleRoleChange = async (userId, currentRole, newRole) => {
      if (updatingRole) return;
      
      try {
        setUpdatingRole(true);
        
        // Map frontend role names to backend role names
        const apiRoleName = newRole === "TeachingAssistant" ? "TA" : newRole;
        
        // Make API call to update role
        await axiosInstance.put(`${API_URL}/api/courses/${courseId}/participant/${userId}/role`, {
          role: apiRoleName
        });
        
        toast.success(`Updated user role to ${newRole === "TeachingAssistant" ? "Teaching Assistant" : newRole}`);
        
        // Reload data instead of manually updating state
        const courseRes = await axiosInstance.get(`${API_URL}/api/courses/${courseId}`);
        
        // Transform and sort course data
        const courseData = courseRes.data.data;
        const transformedData = {
          professors: courseData.professors
            .map(p => ({ id: p.id, name: p.name, email: p.email }))
            .sort((a, b) => a.name.localeCompare(b.name)),
          teachingAssistants: courseData.teachingAssistants
            .map(ta => ({ id: ta.id, name: ta.name, email: ta.email }))
            .sort((a, b) => a.name.localeCompare(b.name)),
          students: courseData.students
            .map(s => ({ id: s.id, name: s.name, email: s.email }))
            .sort((a, b) => a.name.localeCompare(b.name))
        };
        
        setPeople(transformedData);
      } catch (err) {
        toast.error(
          <div align="left">
            <strong>{err.response?.data?.message || "Failed to update role"}</strong>
            <br />
            {err.response?.data?.details || "Could not connect to the server"}
          </div>
        );
      } finally {
        setUpdatingRole(false);
      }
    };
  
    const filterPeople = (list) =>
      list.filter((person) => 
        person.name.toLowerCase().includes(search.toLowerCase()) || 
        person.email.toLowerCase().includes(search.toLowerCase())
      );
  
    const renderPersonList = (list, role) => {
      return filterPeople(list).map((person) => (
        <div key={person.id} className="flex items-center justify-between gap-3 py-2 px-1 hover:bg-gray-50 rounded-md transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-primary/10">
              <AvatarFallback className="text-primary">{initials(person.name)}</AvatarFallback>
            </Avatar>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-left hover:underline">
                  <span className="font-medium text-sm">{person.name}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-primary/10">
                      <AvatarFallback className="text-primary">{initials(person.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-base font-semibold">{person.name}</h4>
                      <p className="text-sm text-muted-foreground">{person.email}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Badge variant={
                      role === "professor" ? "default" : 
                      role === "teachingAssistant" ? "secondary" : 
                      "outline"
                    }>
                      {role === "professor" ? "Professor" : 
                       role === "teachingAssistant" ? "Teaching Assistant" : 
                       "Student"}
                    </Badge>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Role management dropdown for professors */}
          {userRole === "Professor" && role !== "professor" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Users className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {role === "student" && (
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(person.id, "Student", "TeachingAssistant")}
                    disabled={updatingRole}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Make Teaching Assistant
                  </DropdownMenuItem>
                )}
                {role === "teachingAssistant" && (
                  <DropdownMenuItem 
                    onClick={() => handleRoleChange(person.id, "TeachingAssistant", "Student")}
                    disabled={updatingRole}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove as Teaching Assistant
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ));
    };
  
    return (
      <div className="flex-1 h-screen p-6 overflow-auto bg-background box-border">
        <Toaster position="top-right" richColors />
  
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">Loading course participants...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Course Participants</h1>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search people..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Professors */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Professors</span>
                    <Badge variant="default" className="ml-auto">{people.professors.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-1">
                      {renderPersonList(people.professors, "professor")}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
  
              {/* TAs */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <span>Teaching Assistants</span>
                    <Badge variant="secondary" className="ml-auto">{people.teachingAssistants.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-1">
                      {renderPersonList(people.teachingAssistants, "teachingAssistant")}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
  
              {/* Students */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Students</span>
                    <Badge variant="outline" className="ml-auto">{people.students.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-1">
                      {renderPersonList(people.students, "student")}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  };
  
export default CoursePeople;
