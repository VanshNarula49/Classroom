import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/authServices";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { LoginForm } from "@/components/ui/login-form";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useContext(AuthContext);

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
      const token = await loginUser(email, password);
      localStorage.setItem("token", token);

      toast.success("Login Succesful!");
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
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    handleLogin(formData.get("email"), formData.get("password"));
  };

  return (
    <div className="flex justify-center items-center">
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-md shadow-lg p-6 bg-white rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
