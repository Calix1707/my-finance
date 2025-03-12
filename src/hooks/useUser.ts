import { useState, useEffect } from "react";
import supabase from "../supabase-client";

interface User {
  id: string;
  email?: string; 
  profile_picture?: string; 
  user_metadata?: {
    full_name?: string; 
  };
  last_sign_in_at?: string; 
}

interface UserData {
  balance: number;
}

const initialBalance: UserData = { balance: 0 };

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      setUser(supabaseUser);

      if (supabaseUser) {
        const { data: userData, error } = await supabase
          .from("user")
          .select("balance") 
          .eq("id", supabaseUser.id)
          .single();

        if (error) throw error;
        setBalance(userData?.balance || 0);
      }
    } catch (error) {
      console.error("Error al recuperar los datos del usuario:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const updateProfilePicture = async (profilePicture: string) => {
    if (user) {
      try {
        await supabase
          .from("user")
          .update({ profile_picture: profilePicture })
          .eq("id", user.id);
      } catch (error) {
        console.error("Error al actualizar la imagen de perfil:", error);
      }
    }
  };

  return {
    user,
    balance,
    handleLogout,
    updateProfilePicture,
  };
};

export default useUser;
