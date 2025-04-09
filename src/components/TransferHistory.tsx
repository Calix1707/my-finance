import React, { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import styles from "../styles/TransferHistory.module.css";
import "../styles/App.css";

interface Transaction {
  id: number;
  from_account: number;
  to_account_id: number;
  amount: number;
  date: string;
  created_at: string;
}

const TransferHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>("dia");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error: queryError } = await supabase
            .from("transactions")
            .select(
              "id, from_account_int, to_account_int, amount, transfer_date, created_at"
            )
            .eq("user_id", user.id);

          console.log("Datos de transacciones recuperados:", data);
          console.log("Error de consulta:", queryError);

          if (queryError) {
            setError(queryError.message);
          } else if (data) {
            const formattedTransactions: Transaction[] = (data as any[]).map(
              (transaction) => ({
                id: transaction.id,
                from_account: transaction.from_account_int,
                to_account_id: transaction.to_account_int,
                amount: transaction.amount,
                date: transaction.transfer_date,
                created_at: transaction.created_at,
              })
            );
            setTransactions(formattedTransactions);
          }
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchTransactions();
  }, [filter]);

  const filterTransactions = (transaction: Transaction) => {
    const transactionDate = new Date(transaction.date);
    const today = new Date();

    switch (filter) {
      case "dia":
        const todayUTC = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
          )
        );
        const transactionDateUTC = new Date(
          Date.UTC(
            transactionDate.getUTCFullYear(),
            transactionDate.getUTCMonth(),
            transactionDate.getUTCDate()
          )
        );

        console.log(
          "Fecha actual UTC para el filtro:",
          todayUTC.toISOString().slice(0, 10)
        );
        console.log(
          "Fecha de la transacción UTC para el filtro:",
          transactionDateUTC.toISOString().slice(0, 10)
        );

        return (
          transactionDateUTC.toISOString().slice(0, 10) ===
          todayUTC.toISOString().slice(0, 10)
        );
      case "semana":
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(
          today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
        );
        const lastDayOfWeek = new Date(today);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        return (
          transactionDate >= firstDayOfWeek && transactionDate <= lastDayOfWeek
        );
      case "mes":
        return (
          transactionDate.getMonth() === today.getMonth() &&
          transactionDate.getFullYear() === today.getFullYear()
        );
      case "año":
        return transactionDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  return (
    <div className={`form-container ${styles.historyContainer}`}>
      <h2 className={styles.historyTitle}>Historial de transferencias</h2>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.filterButtons}>
        <button onClick={() => setFilter("dia")}>Día</button>
        <button onClick={() => setFilter("semana")}>Semana</button>
        <button onClick={() => setFilter("mes")}>Mes</button>
        <button onClick={() => setFilter("año")}>Año</button>
      </div>
      {transactions.length > 0 ? (
        <ul className={styles.transactionsList}>
          {transactions.filter(filterTransactions).map((transaction) => (
            <li key={transaction.id}>
              De: {transaction.from_account} - A: {transaction.to_account_id} -
              Monto: ${transaction.amount} - Fecha:{" "}
              {new Date(transaction.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noTransactions}>
          No hay transacciones disponibles.
        </p>
      )}
      <button
        onClick={() => navigate("/accounts")}
        className={styles.backButton}
      >
        Atrás
      </button>
    </div>
  );
};

export default TransferHistory;
