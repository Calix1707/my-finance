import React, { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import "../App.css";
import useUser from "../hooks/useUser";

const Home = () => {
  const navigate = useNavigate();
  const { user, balance, handleLogout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("dia");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [income, setIncome] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, [user, timeFilter]);

  const fetchTransactions = async () => {
    if (user) {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("time_filter", timeFilter);

      if (data) {
        const expensesData = data.filter(
          (transaction) => transaction.type === "expense"
        );
        const incomeData = data.filter(
          (transaction) => transaction.type === "income"
        );

        setExpenses(expensesData);
        setIncome(incomeData);
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="home-container">
      <aside className={`sidebar ${isMenuOpen ? "open" : ""}`}>
        <div className="user-profile">
          <div className="profile-picture">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="user-info">
            <h3>{user?.user_metadata?.full_name || "Nombre Completo"}</h3>
            <p>Total: ${balance}</p>
          </div>
        </div>
        <hr />
        <nav>
          <button>Home</button>
          <button>Cuentas</button>
          <button>Añadir Ingresos</button>
          <button>Añadir Gastos</button>
          <button>Recordatorios</button>
          <button onClick={() => navigate("/profile")}>Perfil</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </nav>
      </aside>

      <main className={`content ${isMenuOpen ? "menu-open" : ""}`}>
        <header>
          <div className="app-title">
            <h1>Nombre de la App</h1>
          </div>
          <div className="user-details">
            <h2>{user?.user_metadata?.full_name || "Nombre Completo"}</h2>
            <p>{user?.email || "correo@ejemplo.com"}</p>
            <p>Última Conexión: {user?.last_sign_in_at || "N/A"}</p>
          </div>
        </header>

        <div className="time-filters">
          <button onClick={() => setTimeFilter("dia")}>Día</button>
          <button onClick={() => setTimeFilter("semana")}>Semana</button>
          <button onClick={() => setTimeFilter("mes")}>Mes</button>
          <button onClick={() => setTimeFilter("año")}>Año</button>
        </div>

        <div className="dashboard-content">
          <div className="charts-container">
            <div className="chart-item">
              <h3>Gráfica de Gastos</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="200"
                height="200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2V12Z"></path>
              </svg>
              <div className="expenses-details">
                <h3>Gastos</h3>
                <div className="category-item">
                  <span>Categoría</span>
                  <span>%</span>
                  <span>$Monto</span>
                </div>
                {expenses.map((expense) => (
                  <div className="category-item" key={expense.id}>
                    <span>{expense.category}</span>
                    <span>{expense.percentage}%</span>
                    <span>${expense.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-item">
              <h3>Gráfica de Ingresos</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="200"
                height="200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2V12Z"></path>
              </svg>
              <div className="income-details">
                <h3>Ingresos</h3>
                <div className="category-item">
                  <span>Categoría</span>
                  <span>%</span>
                  <span>$Monto</span>
                </div>
                {income.map((incomeItem) => (
                  <div className="category-item" key={incomeItem.id}>
                    <span>{incomeItem.category}</span>
                    <span>{incomeItem.percentage}%</span>
                    <span>${incomeItem.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
