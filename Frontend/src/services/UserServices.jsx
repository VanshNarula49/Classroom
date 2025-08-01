import axiosInstance from "../utils/axiosInstance";
import { API_CONFIG } from "../config/api";

export const getUserClasses = async() => {
    const courses = await axiosInstance.get(`/courses`);
    return courses.data.data.courses;
};

export const getClass = async(id) => {
    const userClass = await axiosInstance.get(`/courses/${id}`);
    return userClass.data.data;
}

export const getMaterials = async(id) => {
    const userClass = await axiosInstance.get(`/courses/${id}`);
    return userClass.data.data;
}