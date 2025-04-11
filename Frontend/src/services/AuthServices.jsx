import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";

const API_URL = "http://localhost:3000";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
  console.log(response.data)
  return response.data.data.token;
};

export const registerUser = async (formData) => {
  await axios.post(`${API_URL}/api/users/register`, formData);
};