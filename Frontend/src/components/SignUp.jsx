import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../services/authServices";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { SignupForm } from "@/components/ui/signup-form";

const Signup = () => {
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
    <div className="flex justify-center items-center">
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-md shadow-lg p-6 bg-white rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <SignupForm onSubmit={handleSignup} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
