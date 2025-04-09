import { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { User } from "../interfaces";
import { useAuth } from "../contexts/AuthContext";

const useUser = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdditionalUserData = async (currentUser: User | null) => {
    if (currentUser) {
      setLoading(true);
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("profile_picture")
        .eq("id", currentUser.id)
        .single();

      if (userError) {
        console.error("Error fetching user profile data:", userError);
      } else {
        setProfilePicture(userData?.profile_picture || "");
      }

      const { data: accountsData, error: accountsError } = await supabase
        .from("account")
        .select("balance")
        .eq("user_id", currentUser.id);

      if (accountsError) {
        console.error("Error fetching accounts balance:", accountsError);
      } else if (accountsData) {
        const total = accountsData.reduce(
          (sum, account) => sum + account.balance,
          0
        );
        setBalance(total);
      }
      setLoading(false);
    } else {
      setBalance(0);
      setProfilePicture("");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdditionalUserData(user);
  }, [user]);

  const refetchBalance = async () => {
    if (user) {
      setLoading(true);
      const { data, error } = await supabase
        .from("account")
        .select("balance")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error refetching accounts balance:", error);
      } else if (data) {
        const total = data.reduce((sum, account) => sum + account.balance, 0);
        setBalance(total);
      }
      setLoading(false);
    }
  };

  const { logout: contextLogout } = useAuth();

  const handleLogout = async () => {
    await contextLogout();
  };

  return {
    user,
    balance,
    profilePicture,
    handleLogout,
    refetchBalance,
    loading,
  };
};

export default useUser;
