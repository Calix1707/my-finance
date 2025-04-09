import { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { Transaction, User } from "../interfaces";

const useTransactions = (user: User | null) => {
  const [timeFilter, setTimeFilter] = useState("dia");
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .eq("time_filter", timeFilter);

        if (fetchError) {
          console.error("Error fetching transactions:", fetchError);
          setError("Error fetching transactions. Please try again.");
          setIsLoading(false);
          return;
        }

        if (data) {
          const expensesData = data.filter(
            (transaction) => transaction.type === "expense"
          ) as Transaction[];
          const incomeData = data.filter(
            (transaction) => transaction.type === "income"
          ) as Transaction[];

          setExpenses(expensesData);
          setIncome(incomeData);
        }
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user, timeFilter]);

  return { expenses, income, timeFilter, setTimeFilter, isLoading, error };
};

export default useTransactions;
