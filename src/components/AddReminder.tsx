import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";
import useUser from "../hooks/useUser";
import "../styles/App.css";
import "../styles/AddReminder.css";

const AddReminder = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !date || !time) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!user) {
      setError("Usuario no autenticado.");
      return;
    }

    try {
      const combinedDateTime = `${date}T${time}:00Z`;

      const { error: insertError } = await supabase.from("reminder").insert([
        {
          user_id: user.id,
          label: name,
          reminder_datetime: combinedDateTime,
        },
      ]);

      if (insertError) {
        console.error("Error al crear recordatorio:", insertError);
        setError("Ocurrió un error al guardar el recordatorio.");
      } else {
        navigate("/reminders");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <div className="header-container">
        <button onClick={() => navigate("/reminders")}>Atrás</button>
        <h2>Crear Recordatorio</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="reminder-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Recordatorio:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="day">Día:</label>
          <input
            type="text"
            id="day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="Ej: Lunes, Martes, etc."
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Fecha:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Hora:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <button type="submit" className="add-button">
          Crear
        </button>
      </form>
    </div>
  );
};

export default AddReminder;
