import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  console.log("useAuthUser hook called");
  
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      console.log("Fetching auth user...");
      try {
        const response = await getAuthUser();
        console.log("Auth user response:", response);
        return response;
      } catch (error) {
        console.error("Error fetching auth user:", error);
        throw error;
      }
    },
    retry: false, // auth check
  });

  console.log("Auth state:", {
    isLoading: authUser.isLoading,
    isError: authUser.isError,
    error: authUser.error,
    data: authUser.data
  });

  return { 
    isLoading: authUser.isLoading, 
    authUser: authUser.data?.user,
    error: authUser.error
  };
};

export default useAuthUser;