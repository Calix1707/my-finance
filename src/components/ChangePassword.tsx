import React, { useState } from "react";
import supabase from "../supabase-client";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
      alert("Password changed successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleChangePassword}>Change Password</button>
    </div>
  );
};

export default ChangePassword;
