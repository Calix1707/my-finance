import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate("/");
      }
    } catch (error) {
      setError("Ocurrió un error inesperado.");
    }
  };

  const handleGitHubLogin = async () => {
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });

      if (error) {
        setError(error.message);
      }
    } catch (error) {
      setError("Ocurrió un error inesperado.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="input-group">
        <label htmlFor="email">Correo electrónico:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="button-group">
        <button type="submit">Iniciar sesión</button>
      </div>

      <div className="github-button-group">
        <button type="button" onClick={handleGitHubLogin}>
          Iniciar sesión con GitHub
        </button>
      </div>

      <div className="register-link">
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default Login;
