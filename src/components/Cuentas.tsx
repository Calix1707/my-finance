import React, { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { Link, useNavigate } from "react-router-dom";
import "../styles/App.css";
import { useAuth } from "../contexts/AuthContext";
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

const Cuentas: React.FC = () => {
  const { user, loading } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from("account")
          .select("id, account_name, balance, icon")
          .eq("user_id", user.id);

        if (error) throw error;
        setAccounts(data || []);
        const balanceTotal = (data || []).reduce(
          (total, account) => total + account.balance,
          0
        );
        setTotalBalance(balanceTotal);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
      console.log("Cuentas desde Supabase:", accounts);
    }
  }, [user, fetchAccounts]);

  const handleEditAccount = (accountId: string) => {
    navigate(`/edit-account/${accountId}`);
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from("account")
        .delete()
        .eq("id", accountId);
      if (error) throw error;
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getAccountIcon = (accountName: string): string => {
    const lowerCaseName = accountName.toLowerCase();
    if (lowerCaseName.includes("efectivo")) return cashIcon;
    if (lowerCaseName.includes("banco")) return bankIcon;
    if (lowerCaseName.includes("crédito")) return creditCardIcon;
    if (lowerCaseName.includes("débito")) return debitCardIcon;
    if (lowerCaseName.includes("empresa")) return companyIcon;
    if (lowerCaseName.includes("zelle")) return debitCardIcon;
    if (lowerCaseName.includes("bnc")) return bankIcon;
    return "";
  };

  if (loading) {
    return <p>Cargando cuentas...</p>;
  }

  return (
    <div className="accounts-container">
      <button onClick={() => navigate("/")} className="back-button">
        Atrás
      </button>

      <div className="total-overview">
        <div className="total-balance">
          <span>Total</span>
          <p>${totalBalance.toLocaleString()}</p>
        </div>
      </div>

      <Link to="/add-account" className="add-account-button">
        Añadir cuenta
      </Link>

      <div className="horizontal-actions">
        <Link to="/transfer-history" className="action-button">
          Historial de transferencias
        </Link>
        <Link to="/new-transfer" className="action-button">
          Nueva transferencia
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {accounts.length > 0 ? (
        <div className="accounts-list">
          <table>
            <thead>
              <tr>
                <th>Icono</th>
                <th>Nombre</th>
                <th>Saldo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <img
                      src={getAccountIcon(account.account_name)}
                      alt={`Icono de ${account.account_name}`}
                      className="account-icon"
                      style={{ width: "30px", height: "30px" }}
                    />
                  </td>
                  <td>{account.account_name}</td>
                  <td>${account.balance.toLocaleString()}</td>
                  <td className="account-actions">
                    <button
                      onClick={() => handleEditAccount(account.id)}
                      className="edit-button"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="delete-button"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-accounts">No hay cuentas disponibles.</p>
      )}
    </div>
  );
};

export default Cuentas;
