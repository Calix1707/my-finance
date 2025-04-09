import React from "react";
import { User } from "../interfaces";

interface HeaderProps {
  user: User | null;
  balance: number;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, balance, handleLogout }) => {
  return (
    <header>
      <div className="app-title">
        <h1>Nombre de la App</h1>
      </div>
      <div className="user-details">
        <h2>{user?.user_metadata?.full_name || "Nombre Completo"}</h2>
        <p>{user?.email || "correo@ejemplo.com"}</p>
        <p>
          Última Conexión:{" "}
          {user?.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleString()
            : "N/A"}
        </p>
      </div>
    </header>
  );
};

export default Header;
