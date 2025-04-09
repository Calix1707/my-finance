import React, { useState } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import cashIcon from "../assets/icons/cash.png";
import bankIcon from "../assets/icons/bank.png";
import creditCardIcon from "../assets/icons/credit-card.png";
import debitCardIcon from "../assets/icons/debit-card.png";
import companyIcon from "../assets/icons/company.png";

interface Account {
  id: string;
  account_name: string;
  balance: number;
  icon?: string;
}

const AddAccount: React.FC = () => {
  const [accountName, setAccountName] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [icon, setIcon] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("account").insert([
          {
            user_id: user.id,
            account_name: accountName,
            balance: balance,
            icon: icon === "" ? null : icon,
          },
        ]);
        if (error) throw error;

        await new Promise((resolve) => setTimeout(resolve, 500));
        navigate("/accounts");
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error al insertar la cuenta:", err);
    }
  };

  return (
    <div className="form-container">
      <button onClick={() => navigate("/accounts")} className="back-button">
        Atrás
      </button>

      <div className="add-account-form-card">
        {" "}
        {/* Usamos la nueva clase */}
        <h2 className="form-title">Añadir cuenta</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="add-account-form">
          <div className="form-group">
            <label htmlFor="accountName">Nombre de la cuenta:</label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="balance">Monto:</label>
            <input
              type="number"
              id="balance"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="icon">Icono:</label>
            <select
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            >
              <option value="">Ninguno</option>
              <option value={cashIcon}>Efectivo</option>
              <option value={bankIcon}>Banco</option>
              <option value={creditCardIcon}>Tarjeta de Crédito</option>
              <option value={debitCardIcon}>Tarjeta de Débito</option>
              <option value={companyIcon}>Empresa</option>
            </select>
          </div>
          <button type="submit" className="submit-button">
            Añadir
          </button>{" "}
        </form>
      </div>
    </div>
  );
};

export default AddAccount;
