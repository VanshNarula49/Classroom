import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Login from "@/components/Login";
import Signup from "@/components/SignUp";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function AuthTabs() {
  return (
    <div className="flex flex-col min-h-screen">

      <div className="fixed w-full bg-gray-100 text-gray-600 text-sm py-2 border-b z-20 text-center space-y-1">
        <div className="text-xs text-gray-500">
          <p className="text-gray-800">
            <u>Demo Credentials :</u>
            <strong className="ml-4">Professor:</strong>
            <span className="ml-2">Email – <em>joe@example.com</em></span>
            <span className="ml-4">Password – <em>123456</em></span>
            <strong className="ml-6">Student:</strong>
            <span className="ml-2">Email – <em>jane@example.org</em></span>
            <span className="ml-4">Password – <em>123456</em></span>
          </p>

        </div>
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
    </div>
  );
}