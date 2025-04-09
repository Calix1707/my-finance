import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import supabase from "../supabase-client";
import "../styles/App.css";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const errors: { [key: string]: string } = {
    "600": "Usuario no encontrado",
    "601": "Contraseña incorrecta",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log("Login - Iniciando handleSubmit con email:", email);

    try {
      console.log("Login - Valores antes de login:", { email, password });
      const res = await login(email, password);
      console.log("Login - Resultado de login:", res);

      if (!res.success) {
        setError(errors[res.message]);
        console.error(
          "Login - Error en el inicio de sesión:",
          errors[res.message]
        );
        return;
      }

      console.log(
        "Login - Inicio de sesión exitoso, AuthContext manejará el estado."
      );
    } catch (error) {
      console.error("Login - Error en handleSubmit:", error);
      setError("Error inesperado en el inicio de sesión.");
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.error_description || error.message);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Iniciar Sesión</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Iniciar Sesión</button>
        <button type="button" onClick={handleGitHubLogin}>
          Iniciar Sesión con GitHub
        </button>
        <p>
          ¿No tienes una cuenta? <a href="/register">Regístrate</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
