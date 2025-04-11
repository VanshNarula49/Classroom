import axiosInstance from "@/utils/axiosInstance";

const API_URL = "http://localhost:3000";

export const getUserClasses = async() => {
    const courses = await axiosInstance.get(`${API_URL}/api/courses`);
    return courses.data.data.courses;
};

export const getClass = async(id) => {
    const userClass = await axiosInstance.get(`${API_URL}/api/courses/${id}`);
    return userClass.data.data;
}