import supabase from "../supabase-client";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    code: string;
    message: string;
    user?: User;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      setUser(supabaseUser);
      setLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
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

      setUser(data.user);
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
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
