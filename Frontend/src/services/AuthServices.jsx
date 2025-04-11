import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL|| "http://localhost:3000";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
  console.log(response.data)
  return response.data.data.token;
};


export const setUserSession = async (token) => {
  try {

    const res = await axiosInstance.get("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Save user to localStorage
    const user = res.data.data.user;
    localStorage.setItem("user", JSON.stringify(user));
    return { success: true, user };
  } catch (err) {
    console.error("Failed to set user session", err);
    return { success: false, error: err };
  }
};

export const registerUser = async (formData) => {
  await axios.post(`${API_URL}/api/users/register`, formData);
};