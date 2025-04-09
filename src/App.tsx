import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import "./styles/App.css";
import Register from "./Components/Register";
import Confirmation from "./Components/Confirmation";
import Home from "./Components/Home";
import Profile from "./Components/Profile";
import AuthWrapper from "./Components/AuthWrapper";
import Cuentas from "./Components/Cuentas";
import AddAccount from "./Components/AddAccount";
import TransferHistory from "./Components/TransferHistory";
import NewTransfer from "./Components/NewTransfer";
import EditAccount from "./Components/EditAccount";
import AddIncome from "./Components/AddIncome";
import AddExpense from "./Components/AddExpense";
import { AuthProvider } from "./contexts/AuthContext";
import Reminders from "./Components/Reminders";
import AddReminder from "./Components/AddReminder";
import EditReminder from "./Components/EditReminder";

function App() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/accounts" element={<Cuentas />} />
          <Route path="/add-account" element={<AddAccount />} />
          <Route path="/transfer-history" element={<TransferHistory />} />
          <Route path="/new-transfer" element={<NewTransfer />} />
          <Route path="/edit-account/:id" element={<EditAccount />} />
          <Route path="/add-income" element={<AddIncome />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/add-reminder" element={<AddReminder />} />
          <Route path="/edit-reminder/:id" element={<EditReminder />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </AuthWrapper>
    </AuthProvider>
  );
}

export default App;
