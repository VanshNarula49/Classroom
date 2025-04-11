// ClassroomApp.jsx
import React, { useState } from 'react';
import { 
  Bell, 
  ChevronLeft,
  ChevronRight,
  Menu,
  Home, 
  Calendar, 
  BookOpen, 
  Users, 
  Settings,
  LogOut,
  Search,
  Plus,
  MoreHorizontal
} from 'lucide-react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Sample data
const classrooms = [
  {
    id: "cls-1",
    name: "Advanced React Development",
    subject: "Computer Science",
    teacher: "Prof. Sarah Johnson",
    colorClass: "bg-blue-600",
    students: 28,
    banner: "/api/placeholder/400/100",
  },
  {
    id: "cls-2",
    name: "UI/UX Design Principles",
    subject: "Design",
    teacher: "Dr. Michael Chen",
    colorClass: "bg-purple-600",
    students: 23,
  },
  {
    id: "cls-3",
    name: "Web Accessibility Standards",
    subject: "Computer Science",
    teacher: "Lisa Nguyen",
    colorClass: "bg-green-600",
    students: 19,
  },
  {
    id: "cls-4",
    name: "JavaScript Frameworks",
    subject: "Computer Science",
    teacher: "Prof. James Wilson",
    colorClass: "bg-amber-600",
    students: 31,
  },
  {
    id: "cls-5",
    name: "Responsive Design Patterns",
    subject: "Design",
    teacher: "Dr. Emily Rodriguez",
    colorClass: "bg-rose-600",
    students: 25,
  },
  {
    id: "cls-6",
    name: "API Development",
    subject: "Computer Science",
    teacher: "Prof. David Lee",
    colorClass: "bg-cyan-600",
    students: 22,
  },
];

// Main Component
export function Dashboard (){
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 h-full",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center p-4 border-b">
          {isExpanded && <h1 className="text-xl font-bold text-slate-800">Classroom</h1>}
          <Button 
            variant="ghost" 
            size="icon"
            className={cn("ml-auto", !isExpanded && "mx-auto")}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
        
        <nav className="flex-1 py-4">
          <TooltipProvider delayDuration={100}>
            <ul className="space-y-1 px-2">
              {[
                { name: "Dashboard", icon: <Home className="h-5 w-5" /> },
                { name: "Calendar", icon: <Calendar className="h-5 w-5" /> },
                { name: "Courses", icon: <BookOpen className="h-5 w-5" /> },
                { name: "Students", icon: <Users className="h-5 w-5" /> },
              ].map((item) => (
                <li key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={item.name === "Courses" ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start", 
                          !isExpanded && "justify-center p-2"
                        )}
                      >
                        {item.icon}
                        {isExpanded && <span className="ml-3">{item.name}</span>}
                      </Button>
                    </TooltipTrigger>
                    {!isExpanded && <TooltipContent side="right">{item.name}</TooltipContent>}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </nav>

        <div className="p-4 border-t mt-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start", 
                    !isExpanded && "justify-center p-2"
                  )}
                >
                  <Settings className="h-5 w-5" />
                  {isExpanded && <span className="ml-3">Settings</span>}
                </Button>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">Settings</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start text-red-600", 
                    !isExpanded && "justify-center p-2"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {isExpanded && <span className="ml-3">Logout</span>}
                </Button>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center flex-1">
              <h1 className="text-xl font-semibold text-slate-900 ml-8 md:ml-0">Courses</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-8 rounded-full bg-slate-100 border-slate-200 focus-visible:ring-slate-200"
                />
              </div>
              
              <Button variant="outline" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/api/placeholder/32/32" alt="User profile" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Help</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto py-6 px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
                <p className="text-slate-500 mt-1">Manage and access your classes</p>
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button size="sm" variant="outline" className="h-9">
                  <Search className="h-4 w-4 mr-2" />
                  Find
                </Button>
                <Button size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All Courses</TabsTrigger>
                <TabsTrigger value="teaching" onClick={() => setActiveTab("teaching")}>Teaching</TabsTrigger>
                <TabsTrigger value="enrolled" onClick={() => setActiveTab("enrolled")}>Enrolled</TabsTrigger>
                <TabsTrigger value="archived" onClick={() => setActiveTab("archived")}>Archived</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Classrooms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom) => (
                <Card key={classroom.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className={cn(
                    "p-0 h-24 relative", 
                    classroom.colorClass
                  )}>
                    {classroom.banner && (
                      <img 
                        src={classroom.banner} 
                        alt="" 
                        className="object-cover w-full h-full opacity-20 absolute inset-0"
                      />
                    )}
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Settings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Leave class</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="p-4 relative z-10">
                      <CardTitle className="text-white">{classroom.name}</CardTitle>
                      <CardDescription className="text-white/80">{classroom.subject}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{classroom.teacher.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{classroom.teacher}</p>
                        <p className="text-xs text-slate-500">{classroom.students} students</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center border-t">
                    <Badge variant="outline" className="font-normal">
                      {classroom.subject}
                    </Badge>
                    <Button variant="ghost" size="sm">Enter</Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Create Class Card */}
              <Card className="border-dashed bg-transparent hover:bg-white/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-slate-900">Create New Class</h3>
                  <p className="text-sm text-slate-500 text-center mt-1">Set up a new virtual classroom</p>
                  <Button className="mt-4" variant="outline">Get Started</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};