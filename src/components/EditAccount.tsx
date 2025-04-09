import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabase-client";
import styles from "../styles/EditAccount.module.css";
import "../styles/App.css";

interface Account {
  id: string;
  account_name: string;
  balance: number;
  icon?: string;
  user_id: string;
}

const EditAccount: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("account")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setAccount(data);
          setAccountName(data.account_name);
          setBalance(data.balance);
          setIcon(data.icon);
        } else {
          setError("Cuenta no encontrada.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAccountDetails();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!id) {
        setError("ID de cuenta inválido.");
        return;
      }
      const { error } = await supabase
        .from("account")
        .update({ account_name: accountName, balance: balance, icon: icon })
        .eq("id", id);

      if (error) throw error;
      navigate("/accounts");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando detalles de la cuenta...</p>;
  }

  if (error) {
    return <div className={`error-message ${styles.error}`}>{error}</div>;
  }

  if (!account) {
    return <p>No se encontraron los detalles de la cuenta.</p>;
  }

  return (
    <div className={`form-container ${styles.editContainer}`}>
      {" "}
      <div className={styles.backButtonContainer}>
        {" "}
        <button
          onClick={() => navigate("/accounts")}
          className={styles.backButton}
        >
          Atrás
        </button>{" "}
      </div>
      <h2 className={styles.editTitle}>Editar cuenta</h2>{" "}
      <form onSubmit={handleSubmit} className={styles.editForm}>
        {" "}
        <label className={styles.formLabel}>
          {" "}
          Nombre de la cuenta:
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className={styles.formInput}
          />
        </label>
        <label className={styles.formLabel}>
          {" "}
          Saldo:
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            className={styles.formInput}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {" "}
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditAccount;
