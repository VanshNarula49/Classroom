import axios from "axios";

// Create an axios instance with your base API URL.
const axiosInstance = axios.create({
  baseURL:import.meta.env.VITE_API_URL|| "http://localhost:3000" // Change to your API URL
});

// Request Interceptor: Attach token from localStorage (or another storage mechanism)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or retrieve from your context/state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Check for authentication errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid/expired, your API should return a 401 Unauthorized error.
    if (error.response && error.response.status === 401) {
      console.log(error)
      // Optionally remove the token from storage
      localStorage.removeItem("token");
      // Redirect to login. Note: window.location.href is used here because interceptors
      // may not have access to React Router's navigation.
      window.location.href = "/login";
    }
    if (error.response && error.response.status === 403) {
      console.log(error)
    
      window.location.href = "/dashboard";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
