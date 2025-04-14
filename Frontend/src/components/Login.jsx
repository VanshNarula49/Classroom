import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, setUserSession } from "../services/authServices";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { LoginForm } from "@/components/ui/login-form";
import { useUser } from "@/hooks/useUser";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useContext(AuthContext);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLogin = async (email, password) => {
    try {
      setIsSubmitting(true);
      const token = await loginUser(email, password);
      localStorage.setItem("token", token);
      setUserSession(token);
      toast.success("Login Successful!");
      setTimeout(() => {
        setToken(token);
      }, 700);
    } catch (err) {
      toast.error(
        <div align="left">
          <strong>{err.response?.data?.message || "Login failed"}</strong>
          <br />
          {err.response?.data?.details || "Cannot connect to server"}
        </div>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    handleLogin(formData.get("email"), formData.get("password"));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background to-background/90 animate-fade-in">
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-md shadow-lg p-6 bg-card rounded-xl animate-slide-up border-muted/30">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-background/20 rounded-xl opacity-50" />
        <CardHeader className="relative">
          {/* Logo Section */}
          <div className="flex justify-center mb-6 animate-slide-down delay-1">
            <div 
              className="flex items-center gap-2 transition-all duration-300 ease-in-out cursor-pointer group"
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              onClick={() => navigate('/')}
            >
              <div className={cn(
                "h-10 w-10 rounded-md bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center transition-all duration-500",
                isLogoHovered ? "shadow-lg shadow-primary/20 scale-110 rotate-3" : ""
              )}>
                <Layers className={cn(
                  "h-5 w-5 text-primary-foreground transition-all duration-500",
                  isLogoHovered ? "scale-110" : ""
                )} />
              </div>
              <span className={cn(
                "font-semibold text-xl transition-all duration-300",
                isLogoHovered ? "text-primary" : "text-foreground"
              )}>
                Campus<span className="text-primary font-bold">Cloud</span>
              </span>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-semibold text-center animate-slide-up delay-2">
            Login
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground animate-slide-up delay-3">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          
          <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in delay-5">
            <span>Don't have an account? </span>
            <a 
              href="/signup" 
              className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
