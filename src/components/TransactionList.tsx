import React from "react";
import { Transaction } from "../interfaces";

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({
  title,
  transactions,
}) => {
  return (
    <div className={`${title.toLowerCase()}-details`}>
      <h3>{title}</h3>
      <div className="category-item">
        <span>Categoría</span>
        <span>%</span>
        <span>$Monto</span>
      </div>
      {transactions.map((transaction) => (
        <div className="category-item" key={transaction.id}>
          <span>{transaction.category}</span>
          <span>{transaction.percentage}%</span>
          <span>${transaction.amount}</span>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
