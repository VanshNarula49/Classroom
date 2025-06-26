import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Login from "@/components/Login";
import Signup from "@/components/SignUp";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function AuthTabs() {
  return (
    <div className="flex flex-col min-h-screen">

      <div className="fixed w-full bg-gray-100 text-gray-600 text-sm py-2 border-b z-20 text-center space-y-1">
        <div>This page's database refreshes automatically every 24 hours.</div>
      </div>


      <div>
      <div className="flex flex-col items-center min-h-screen">
        <Tabs
          defaultValue="login"
          className="flex flex-cols justify-center items-center w-full max-w-md"
        >
          <TabsList className="flex w-full max-w-xs bg-gray-100 rounded-lg p-1 fixed top-10 z-10">
            <TabsTrigger value="login" className="flex-1">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">
              Sign Up
            </TabsTrigger>
          </TabsList>
          <div className="mt-1 w-full max-w-md min-h-screen">
            <TabsContent value="login">
              <Login />
            </TabsContent>
            <TabsContent value="signup">
              <Signup />
            </TabsContent>
          </div>
        </Tabs>
        </div>
      </div>
      <div className="fixed bottom-0 w-full bg-gray-100 text-gray-600 text-sm py-2 border-t text-center">
        <div className="text-xs text-gray-500">
          <strong>Test Logins:</strong> joe@example.com / 123456 (Professor), jane@example.org / 123456 (Student)
        </div>
        © 2025 CampusCloud
      </div>
    </div>
  );
}