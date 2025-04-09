import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/confirmation";

  console.log("AuthWrapper User:", user);
  console.log("AuthWrapper Loading:", loading);
  console.log("AuthWrapper Location:", location.pathname);

  useEffect(() => {
    console.log("AuthWrapper useEffect triggered");
    console.log("AuthWrapper useEffect - User:", user);

    if (!loading) {
      if (!user && !isAuthRoute) {
        console.log("AuthWrapper: No usuario, redirigiendo a /login");
        navigate("/login");
      }

      if (user && isAuthRoute) {
        console.log(
          "AuthWrapper: Usuario autenticado en ruta de auth, redirigiendo a /home"
        );
        navigate("/home");
      }
    }
  }, [user, loading, isAuthRoute, navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child);
    }
    return child;
  });
};

export default AuthWrapper;
