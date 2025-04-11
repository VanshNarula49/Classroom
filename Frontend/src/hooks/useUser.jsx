import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    } else {
      const fetchUser = async () => {
        try {
          const res = await axiosInstance.get("/api/users/profile"); // your user API
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
          setUser(res.data);
        } catch (err) {
          toast.error(
            <div align="left">
              <strong>{err.response?.data?.message || "Failed to load user"}</strong>
              <br />
              {err.response?.data?.details || "Could not connect to the server"}
            </div>
          );
        }
      };

      fetchUser();
    }
  }, []);

  return user;
}
