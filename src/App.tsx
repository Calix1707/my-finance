
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Confirmation from "./Components/Confirmation";
import Home from "./Components/Home";
import Profile from "./Components/Profile";
import useUser from "./hooks/useUser";
import AuthWrapper from "./Components/AuthWrapper"; 

function App() {
  const { user } = useUser();

  return (
    <Router basename="/">
      <AuthWrapper> 
        <Routes>
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;