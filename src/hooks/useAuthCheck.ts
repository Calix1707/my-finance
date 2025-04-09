import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";

const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Estado del usuario:", user);
      if (
        !user &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);
};

export default useAuthCheck;
