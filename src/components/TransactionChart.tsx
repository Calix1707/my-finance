import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Transaction } from "../interfaces";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TransactionChartProps {
  title: string;
  data: Transaction[];
  type: "income" | "expense";
}

const TransactionChart: React.FC<TransactionChartProps> = ({
  title,
  data,
  type,
}) => {
  const chartData = {
    labels: data.map((transaction) => transaction.category),
    datasets: [
      {
        label: title,
        data: data.map((transaction) => transaction.amount),
        backgroundColor:
          type === "expense"
            ? "rgba(255, 99, 132, 0.2)"
            : "rgba(54, 162, 235, 0.2)",
        borderColor:
          type === "expense"
            ? "rgba(255, 99, 132, 1)"
            : "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-item">
      <h3>{title}</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default TransactionChart;
