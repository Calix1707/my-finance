import React, { useState, useEffect } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import useUser from "../hooks/useUser";
import { Transaction } from "../interfaces";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface CategoryColors {
  Regalos?: string;
  Salario?: string;
  Comida?: string;
  Inversiones?: string;
  Otros?: string;
  [key: string]: string | undefined;
}

const categoryColors: CategoryColors = {
  Regalos: "rgba(255, 99, 132, 0.6)",
  Salario: "rgba(54, 162, 235, 0.6)",
  Comida: "rgba(255, 206, 86, 0.6)",
  Inversiones: "rgba(75, 192, 192, 0.6)",
  Otros: "rgba(153, 102, 255, 0.6)",
};

const categoryEmojis: { [key: string]: string } = {
  Regalos: "🎁",
  Salario: "💰",
  Comida: "🍔",
  Inversiones: "📈",
  Otros: "🏷️",
};

const generateColor = (category: string) => {
  return categoryColors[category] || "rgba(200, 200, 200, 0.6)";
};

const Home = () => {
  const navigate = useNavigate();
  const { user, balance, handleLogout, loading } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("dia");
  const [expenses, setExpenses] = useState<
    { desc: string; amount: number; percentage: string }[]
  >([]);
  const [income, setIncome] = useState<
    { desc: string; amount: number; percentage: string }[]
  >([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchTransactions();
  }, [user, timeFilter, navigate]);

  const fetchTransactions = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("time_filter", timeFilter)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return;
      }

      if (data) {
        const expensesData = data.filter(
          (transaction) => transaction.type === "expense"
        ) as Transaction[];
        const incomeData = data.filter(
          (transaction) => transaction.type === "income"
        ) as Transaction[];

        const groupedExpenses: { [key: string]: number } = {};
        expensesData.forEach((expense) => {
          groupedExpenses[expense.desc] =
            (groupedExpenses[expense.desc] || 0) + expense.amount;
        });

        const groupedIncome: { [key: string]: number } = {};
        incomeData.forEach((incomeItem) => {
          groupedIncome[incomeItem.desc] =
            (groupedIncome[incomeItem.desc] || 0) + incomeItem.amount;
        });

        const totalExpenses = Object.values(groupedExpenses).reduce(
          (sum, amount) => sum + amount,
          0
        );
        const totalIncome = Object.values(groupedIncome).reduce(
          (sum, amount) => sum + amount,
          0
        );

        const expensesWithPercentage = Object.entries(groupedExpenses).map(
          ([desc, amount]) => ({
            desc,
            amount,
            percentage:
              totalExpenses > 0
                ? ((amount / totalExpenses) * 100).toFixed(1)
                : "0",
          })
        );

        const incomeWithPercentage = Object.entries(groupedIncome).map(
          ([desc, amount]) => ({
            desc,
            amount,
            percentage:
              totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : "0",
          })
        );

        setExpenses(expensesWithPercentage);
        setIncome(incomeWithPercentage);
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const generateChartData = (
    groupedTransactions: { desc: string; amount: number; percentage: string }[],
    label: string
  ) => {
    return {
      labels: groupedTransactions.map((item) => item.desc),
      datasets: [
        {
          label: label,
          data: groupedTransactions.map((item) => item.amount),
          backgroundColor: groupedTransactions.map((item) =>
            generateColor(item.desc)
          ),
          borderColor: groupedTransactions.map((item) =>
            generateColor(item.desc).replace("0.6", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const expensesChartData = generateChartData(expenses, "Gastos");
  const incomeChartData = generateChartData(income, "Ingresos");

  if (loading) {
    return <div>Cargando información del usuario...</div>;
  }

  return (
    <div className="home-container">
      <aside className={`sidebar ${isMenuOpen ? "open" : ""}`}>
        {user && (
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
              <p>Total: ${balance.toLocaleString()}</p>
            </div>
          </div>
        )}
        <hr />
        <nav>
          <button>Home</button>
          <button onClick={() => navigate("/accounts")}>Cuentas</button>
          <button onClick={() => navigate("/add-income")}>
            Añadir Ingresos
          </button>
          <button onClick={() => navigate("/add-expense")}>
            Añadir Gastos
          </button>
          <button onClick={() => navigate("/reminders")}>Recordatorios</button>
          <button onClick={() => navigate("/profile")}>Perfil</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </nav>
      </aside>

      <main className={`content ${isMenuOpen ? "menu-open" : ""}`}>
        <header>
          <div className="app-title">
            <h1>PiggyBank</h1>
          </div>
          {user && (
            <div className="user-details">
              <h2>{user?.user_metadata?.full_name || "Nombre Completo"}</h2>
              <p>{user?.email || "correo@ejemplo.com"}</p>
              <p>Última Conexión: {user?.last_sign_in_at || "N/A"}</p>
            </div>
          )}
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
              {expenses.length > 0 ? (
                <Pie
                  data={expensesChartData}
                  options={{ plugins: { legend: { display: false } } }}
                />
              ) : (
                <p>No hay gastos para mostrar.</p>
              )}
              <div className="expenses-details">
                <h3>Gastos</h3>
                <div className="category-item header">
                  <span>Categoría</span>
                  <span>%</span>
                  <span>$Monto</span>
                </div>
                <div className="expenses-list">
                  {expenses
                    .slice(0, 5)
                    .map(
                      (item: {
                        desc: string;
                        amount: number;
                        percentage: string;
                      }) => (
                        <div className="category-item" key={item.desc}>
                          <span>
                            {categoryEmojis[item.desc] || ""} {item.desc}
                          </span>
                          <span>{item.percentage}%</span>
                          <span>${item.amount}</span>
                        </div>
                      )
                    )}
                  {expenses.length > 5 && (
                    <div className="category-item more">
                      <span>...</span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="chart-item">
              <h3>Gráfica de Ingresos</h3>
              {income.length > 0 ? (
                <Pie
                  data={incomeChartData}
                  options={{ plugins: { legend: { display: false } } }}
                />
              ) : (
                <p>No hay ingresos para mostrar.</p>
              )}
              <div className="income-details">
                <h3>Ingresos</h3>
                <div className="category-item header">
                  <span>Categoría</span>
                  <span>%</span>
                  <span>$Monto</span>
                </div>
                <div className="income-list">
                  {income
                    .slice(0, 5)
                    .map(
                      (item: {
                        desc: string;
                        amount: number;
                        percentage: string;
                      }) => (
                        <div className="category-item" key={item.desc}>
                          <span>
                            {categoryEmojis[item.desc] || ""} {item.desc}
                          </span>
                          <span>{item.percentage}%</span>
                          <span>${item.amount}</span>
                        </div>
                      )
                    )}
                  {income.length > 5 && (
                    <div className="category-item more">
                      <span>...</span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
