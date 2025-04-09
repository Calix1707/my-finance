import React, { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import styles from "../styles/AddExpense.module.css";
import useUser from "../hooks/useUser";

interface Account {
  id: number;
  account_name: string;
  balance: number;
}

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const { user, refetchBalance } = useUser();
  const [amount, setAmount] = useState<number>(0);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("account")
          .select("id, account_name, balance")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching accounts:", error);
          setError("Error al cargar las cuentas.");
        } else if (data) {
          setAccounts(data);
        }
      }
    };

    fetchAccounts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0 || accountId === null || !category) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!user) {
      setError("Usuario no autenticado.");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            type: "expense",
            amount: amount,
            account_id: accountId,
            desc: category,
            transfer_date: date,
            time_filter: "dia",
          },
        ]);

      if (insertError) {
        console.error("Error al insertar gasto:", insertError);
        setError("Ocurrió un error al guardar el gasto.");
        return;
      }

      const { data: currentAccountData, error: fetchAccountError } =
        await supabase
          .from("account")
          .select("balance")
          .eq("id", accountId)
          .single();

      if (fetchAccountError) {
        console.error(
          "Error al obtener el saldo actual de la cuenta:",
          fetchAccountError
        );
        setError("Error al obtener el saldo actual de la cuenta.");
        return;
      }

      const currentBalance = currentAccountData?.balance || 0;
      const newBalance = currentBalance - amount;

      const { error: updateError } = await supabase
        .from("account")
        .update({ balance: newBalance })
        .eq("id", accountId);

      if (updateError) {
        console.error(
          "Error al actualizar el saldo de la cuenta:",
          updateError
        );
        setError("Error al actualizar el saldo de la cuenta.");
      } else {
        await refetchBalance();
        navigate("/accounts");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.addExpenseContainer}>
      <div className={styles.headerContainer}>
        <button onClick={() => navigate("/home")}>Atrás</button>
        <h2>Añadir Gasto</h2>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.expenseForm}>
        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.formLabel}>
            Monto:
          </label>
          <input
            type="number"
            id="amount"
            className={styles.formInput}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="accountId" className={styles.formLabel}>
            Cuenta:
          </label>
          <select
            id="accountId"
            className={styles.formSelect}
            value={accountId === null ? "" : accountId}
            onChange={(e) => setAccountId(parseInt(e.target.value, 10))}
          >
            <option value="">Seleccionar Cuenta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Categoría:</label>
          <div className={styles.categoryIcons}>
            <button type="button" onClick={() => setCategory("🛒 Comida")}>
              🛒
            </button>
            <button type="button" onClick={() => setCategory("🏠 Servicios")}>
              🏠
            </button>
            <button type="button" onClick={() => setCategory("🚗 Transporte")}>
              🚗
            </button>
            <button type="button" onClick={() => setCategory("🎉 Ocio")}>
              🎉
            </button>
            <input
              type="text"
              id="category"
              className={styles.formInput}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="O escribe tu categoría"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.formLabel}>
            Fecha del Gasto:
          </label>
          <input
            type="date"
            id="date"
            className={styles.formInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.addButton}>
          Añadir
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
