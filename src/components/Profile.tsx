import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";
import "../App.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedProfileIcon, setSelectedProfileIcon] = useState<string>("");

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
      setProfilePicture(userData?.profile_picture || "");
      setFullName(user?.user_metadata?.full_name || "");
      setEmail(user?.email || "");
    }
  };

  const handleBack = () => {
    navigate("/home");
  };

  const handleChangePassword = () => {};

  const handleSave = async () => {
    if (user) {
      await supabase
        .from("user")
        .update({ profile_picture: selectedProfileIcon })
        .eq("id", user.id);
    }
  };

  return (
    <div className="profile-container">
      <button onClick={handleBack}>Atrás</button>
      <div className="profile-picture-container">
        <img src={profilePicture} className="profile-picture" />
      </div>
      <div className="profile-details">
        <div className="profile-info">
          <strong>Nombre Completo:</strong> {fullName}
        </div>
        <div className="profile-info">
          <strong>Email:</strong> {email}
        </div>
        <div className="profile-info">
          <strong>Contraseña:</strong> *****{" "}
          <button onClick={handleChangePassword}>Cambiar Contraseña</button>
        </div>
      </div>
      <div className="profile-icons">
        <button onClick={() => setSelectedProfileIcon("icon1")}>Icono 1</button>
        <button onClick={() => setSelectedProfileIcon("icon2")}>Icono 2</button>
        <button onClick={() => setSelectedProfileIcon("icon3")}>Icono 3</button>
      </div>
      <button onClick={handleSave}>Guardar Cambios</button>
    </div>
  );
};

export default Profile;
