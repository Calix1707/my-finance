import supabase from "../supabase-client";
import { User } from "../interfaces";
import { useState, useEffect } from "react";

async function login(
  email: string,
  password: string
): Promise<{ success: boolean; code: string; message: string; user?: User }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (typeof error.code === "string") {
        return { success: false, code: error.code, message: error.message };
      } else {
        return {
          success: false,
          code: "UNKNOWN_ERROR",
          message: error.message,
        };
      }
    }

    return {
      success: true,
      code: "00",
      message: "Inicio de sesión exitoso",
      user: data.user,
    };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, code: "99", message: "Error inesperado" };
  }
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      console.log("useAuth - Usuario obtenido de Supabase:", supabaseUser);
      console.log("useAuth - Actualizando estado del usuario:", supabaseUser);
      setUser(supabaseUser);
      console.log("useAuth - Estado del usuario:", supabaseUser);
      setLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("useAuth - Evento onAuthStateChange:", event, session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading, setUser };
};

export { login, useAuth };
