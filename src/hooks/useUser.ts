import { useState, useEffect } from "react";
import supabase from "../supabase-client";

const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: userData } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single();
      setBalance(userData?.balance || 0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfilePicture = async (profilePicture: string) => {
    if (user) {
      await supabase
        .from("user")
        .update({ profile_picture: profilePicture })
        .eq("id", user.id);
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
