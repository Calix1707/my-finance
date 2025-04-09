import React, { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

interface Account {
  id: number;
  account_name: string;
  balance: number;
}

const NewTransfer: React.FC = () => {
  const [fromAccount, setFromAccount] = useState<number | null>(null);
  const [toAccount, setToAccount] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("account")
            .select("id, account_name, balance")
            .eq("user_id", user.id);

          if (error) throw error;
          setAccounts((data as Account[]) || []);
          console.log("Cuentas cargadas:", data);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      fromAccount === null ||
      toAccount === null ||
      amount <= 0 ||
      fromAccount === toAccount
    ) {
      setError(
        "Por favor, selecciona cuentas válidas y un monto mayor a cero."
      );
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: fromAccountData, error: fromError } = await supabase
          .from("account")
          .select("balance")
          .eq("id", fromAccount)
          .single();

        const { data: toAccountData, error: toError } = await supabase
          .from("account")
          .select("balance")
          .eq("id", toAccount)
          .single();

        if (fromError || toError) {
          throw new Error("Error al obtener los saldos de las cuentas.");
        }

        if (!fromAccountData || !toAccountData) {
          throw new Error("No se encontraron los datos de las cuentas.");
        }

        const newFromBalance = fromAccountData.balance - amount;
        const newToBalance = toAccountData.balance + amount;

        if (newFromBalance < 0) {
          setError("Saldo insuficiente en la cuenta de origen.");
          return;
        }

        const { error: updateFromError } = await supabase
          .from("account")
          .update({ balance: newFromBalance })
          .eq("id", fromAccount);

        if (updateFromError) {
          throw new Error(
            "Error al actualizar el saldo de la cuenta de origen."
          );
        }

        const { error: updateToError } = await supabase
          .from("account")
          .update({ balance: newToBalance })
          .eq("id", toAccount);

        if (updateToError) {
          throw new Error(
            "Error al actualizar el saldo de la cuenta de destino."
          );
        }
        console.log("fromAccount antes de insertar:", fromAccount);
        console.log("toAccount antes de insertar:", toAccount);
        console.log("amount antes de insertar:", amount);
        console.log("date antes de insertar:", date);
        const { error: insertError } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: user.id,
              from_account_int: fromAccount,
              to_account_int: toAccount,
              amount: amount,
              transfer_date: date,
            },
          ]);
        if (insertError) {
          console.error("Error al insertar transacción:", insertError);
          throw insertError;
        }

        navigate("/transfer-history");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <button onClick={() => navigate("/accounts")} className="back-button">
        Atrás
      </button>

      <div className="add-account-form-card">
        <h2 className="form-title">Crear una transferencia</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="add-account-form">
          {" "}
          <div className="form-group">
            {" "}
            <label>
              Cuenta de origen:
              <select
                className="add-account-form select"
                value={fromAccount === null ? "" : fromAccount}
                onChange={(e) => setFromAccount(parseInt(e.target.value, 10))}
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-group">
            {" "}
            <label>
              Cuenta de destino:
              <select
                className="add-account-form select"
                value={toAccount === null ? "" : toAccount}
                onChange={(e) => setToAccount(parseInt(e.target.value, 10))}
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-group">
            <label>
              Monto:
              <input
                type="number"
                className="add-account-form input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="form-group">
            {" "}
            <label>
              Fecha:
              <input
                type="date"
                className="add-account-form input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="submit-button add-account-form submit-button"
          >
            Transferir
          </button>{" "}
        </form>
      </div>
    </div>
  );
};

export default NewTransfer;
