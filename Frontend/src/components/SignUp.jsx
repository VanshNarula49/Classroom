import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../services/AuthServices";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { SignupForm } from "@/components/ui/signup-form";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useContext(AuthContext);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("error")) {
      toast.error(
        <div align="left">
          <strong>{queryParams.get("error")}</strong>
          <br />
          {queryParams.get("details")}
        </div>
      );
    }
  }, [location]);

  const handleSignup = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const token = await registerUser(userData);
      toast.success(
        <div align="left">
          <strong>{ "Registered Succesfully"}</strong>
          <br />
          {""}
        </div>
      );
      // localStorage.setItem("token", token);
      // setToken(token);
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    
    } catch (err) {
      toast.error(
        <div align="left">
          <strong>{err.response?.data?.message || "Signup failed"}</strong>
          <br />
          {err.response?.data?.details || "Cannot connect to server"}
        </div>
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background to-background/90 animate-fade-in">
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-md shadow-lg p-6 bg-white rounded-xl">
        <CardHeader>
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div 
              className="flex items-center gap-2 transition-all duration-300 ease-in-out cursor-pointer"
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              onClick={() => navigate('/')}
            >
              <div className={cn(
                "h-10 w-10 rounded-md bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center transition-all duration-300",
                isLogoHovered ? "shadow-md shadow-primary/20 scale-105" : ""
              )}>
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className={cn(
                "font-semibold text-xl transition-all duration-300",
                isLogoHovered ? "text-primary" : "text-foreground"
              )}>
                Campus<span className="text-primary font-bold">Cloud</span>
              </span>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-semibold text-center">Sign Up</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm onSubmit={handleSignup} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
