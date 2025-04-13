import { useEffect, useState } from "react";
import { getUserClasses} from "../services/UserServices";
import { ClassroomCard } from "./classroom-card";
import { toast, Toaster } from "sonner";

export default function Dashboard() {
  const [userClasses, setUserClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getUserClasses();
        setUserClasses(res);
        console.log(res);
      } catch (err) {
        toast.error(
          <div align="left">
            <strong>{err.response?.data?.message || "Failed to fetch classes"}</strong>
            <br />
            {err.response?.data?.details || "Unable to Connect to the Server"}
          </div>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [userClasses]);

  return (
    <div className="mx-auto px-2">
      <Toaster position="top-right" richColors />

      {loading && (
        <p className="text-center text-gray-600 py-4">Loading classes...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-10">
        {userClasses.map((cls, index) => (
          <ClassroomCard
            key={index}
            name={cls.name}
            courseCode={cls.code}
            professor={cls.creator_name}
            role = {cls.userrole}
            id = {cls.courseid}
          />
        ))}
      </div>
    </div>
  );
}