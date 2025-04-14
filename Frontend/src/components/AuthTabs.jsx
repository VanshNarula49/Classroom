import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Login from "@/components/Login";
import Signup from "@/components/SignUp";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function AuthTabs() {
  return (
    <div className="flex flex-col min-h-screen">
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
          <div className="mt-20 w-full max-w-md min-h-screen items-center">
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
  );
}
