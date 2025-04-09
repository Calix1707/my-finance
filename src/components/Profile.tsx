import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";
import styles from "../styles/Profile.module.css";
import "../styles/App.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedProfileIcon, setSelectedProfileIcon] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: userData, error } = await supabase
          .from("user")
          .select("*")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        setProfilePicture(userData?.profile_picture || "");
        setFullName(user?.user_metadata?.full_name || "");
        setEmail(user?.email || "");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    navigate("/home");
    console.log("Navigating to /home");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(`public/${user?.id}`, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw error;
      const publicUrl = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(data.path);
      setProfilePicture(publicUrl.data.publicUrl);
      setSelectedProfileIcon("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      if (!fullName) {
        setFullNameError("Full Name is required");
        return;
      } else {
        setFullNameError(null);
      }

      if (!email) {
        setEmailError("Email is required");
        return;
      } else {
        setEmailError(null);
      }

      if (user) {
        const pictureToSave = profilePicture || selectedProfileIcon;
        const { error: updateError } = await supabase
          .from("user")
          .update({
            profile_picture: pictureToSave,
            full_name: fullName,
            email: email,
          })
          .eq("id", user.id);
        if (updateError) throw updateError;
      }
      alert("Changes Saved!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <button onClick={handleBack} className={styles.backButton}>
        Atrás
      </button>
      <div className={styles.profileCard}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div
          className={styles.profilePictureContainer}
          onClick={handleImageClick}
        >
          {selectedProfileIcon || profilePicture ? (
            <img src={selectedProfileIcon || profilePicture} alt="Profile" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="fullName" className={styles.formLabel}>
            Nombre completo:
          </label>
          <input
            type="text"
            id="fullName"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.formInput}
          />
          {fullNameError && (
            <div className={styles.errorMessage}>{fullNameError}</div>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Correo electrónico:
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.formInput}
          />
          {emailError && (
            <div className={styles.errorMessage}>{emailError}</div>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            Contraseña:
          </label>
          <div className={styles.passwordContainer}>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.formInput}
            />
            <button
              onClick={handleChangePassword}
              className={styles.passwordButton}
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
        <div className={styles.profileIcons}>
          <img
            src="icon1.png"
            alt="Icon 1"
            onClick={() => setSelectedProfileIcon("icon1.png")}
            className={
              selectedProfileIcon === "icon1.png" ? styles.selected : ""
            }
          />
          <img
            src="icon2.png"
            alt="Icon 2"
            onClick={() => setSelectedProfileIcon("icon2.png")}
            className={
              selectedProfileIcon === "icon2.png" ? styles.selected : ""
            }
          />
          <img
            src="icon3.png"
            alt="Icon 3"
            onClick={() => setSelectedProfileIcon("icon3.png")}
            className={
              selectedProfileIcon === "icon3.png" ? styles.selected : ""
            }
          />
        </div>
        <button onClick={handleSave} className={styles.saveButton}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default Profile;
