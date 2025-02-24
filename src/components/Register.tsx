import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";

const Register = () => {
  const [full_name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const { error: userError } = await supabase.from("user").insert([
        {
          id: authData?.user?.id ?? null,
          full_name: full_name,
          email,
          currency,
        },
      ]);

      if (userError) {
        await supabase.auth.signOut();
        if (authData?.user?.id) {
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (deletionError) {
            console.error(
              "Error deleting user from auth.users:",
              deletionError
            );
          }
        }
        setError(userError.message);
        return;
      }

      setShowConfirmationAlert(true);
    } catch (error) {
      console.error("General error:", error);
      setError("Ocurrió un error inesperado.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div className="input-group">
        <label htmlFor="fullname">Nombre completo:</label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          value={full_name}
          onChange={(e) => setFullname(e.target.value)}
          required
        />
      </div>

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

      <div className="input-group">
        <label htmlFor="confirmPassword">Confirmar contraseña:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="currency">Moneda de cuenta principal:</label>
        <select
          id="currency"
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        >
          <option value="USD">USD</option>
          <option value="BS">BS</option>
        </select>
      </div>

      <div className="button-group">
        <button type="submit">Registrar</button>
        <button type="button" onClick={() => navigate("/login")}>
          Cancelar
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showConfirmationAlert && (
        <div>
          {showConfirmationAlert && (
            <div className="confirmation-alert">
              <p>¡Registro exitoso!</p>
              <button>Aceptar</button>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default Register;
