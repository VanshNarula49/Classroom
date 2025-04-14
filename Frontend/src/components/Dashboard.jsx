import { useEffect, useState } from "react";
import { getUserClasses} from "../services/UserServices";
import { ClassroomCard } from "./classroom-card";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";

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
  }, []);

  return (
    <div className="mx-auto px-2 animate-fade-in">
      <Toaster position="top-right" richColors />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8 animate-slide-left">Your Classes</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10">
            {userClasses.map((cls, index) => (
              <div 
                key={index} 
                className={cn(
                  "animate-slide-up transition-all duration-500", 
                  `delay-${(index % 5) + 1}`
                )}
              >
                <ClassroomCard
                  name={cls.name}
                  courseCode={cls.code}
                  professor={cls.creator_name}
                  role={cls.userrole}
                  id={cls.courseid}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}