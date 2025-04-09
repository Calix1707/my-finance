import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../supabase-client";
import { Reminder } from "../interfaces";
import useUser from "../hooks/useUser";
import "../styles/App.css";
import "../styles/EditReminder.css";

interface SupabaseSingleResult<T> {
  data: T | null;
  error: any;
}

const EditReminder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminder = async () => {
      if (id && user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("reminder")
            .select("*")
            .eq("id", parseInt(id))
            .eq("user_id", user.id)
            .returns<Reminder | null>()
            .single();

          if (error) {
            console.error("Error fetching reminder:", error);
            setError("Error al cargar el recordatorio.");
          } else {
            setReminder(data);
            if (data) {
              const fetchedReminder = data as Reminder;
              setName(fetchedReminder.label ?? "");
              setDate(
                fetchedReminder.reminder_datetime?.substring(0, 10) ??
                  fetchedReminder.created_at?.substring(0, 10) ??
                  ""
              );
              setTime(
                fetchedReminder.reminder_datetime?.substring(11, 16) ??
                  fetchedReminder.created_at?.substring(11, 16) ??
                  ""
              );
              setIsActive(fetchedReminder.is_active ?? false);
            } else {
              setError("Recordatorio no encontrado.");
            }
          }
        } catch (err) {
          console.error("Error fetching reminder:", err);
          setError("Error inesperado al cargar el recordatorio.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReminder();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id) {
      setError("ID de recordatorio inválido.");
      return;
    }

    try {
      const combinedDateTime = `${date}T${time}:00Z`;
      const { error: updateError } = await supabase
        .from("reminder")
        .update({
          label: name,
          reminder_datetime: combinedDateTime,
          is_active: isActive,
        })
        .eq("id", parseInt(id));

      if (updateError) {
        console.error("Error updating reminder:", updateError);
        setError("Error al guardar los cambios.");
      } else {
        navigate("/reminders");
      }
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError("Error inesperado al guardar los cambios.");
    }
  };

  if (loading) {
    return <div>Cargando recordatorio...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {reminder && (
        <div className="form-container">
          <div className="header-container">
            <button onClick={() => navigate("/reminders")}>Atrás</button>
            <h2>Editar Recordatorio</h2>
          </div>
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
            <div className="form-group">
              <label htmlFor="is_active">¿Listo?</label>
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
            <button type="submit" className="save-button">
              Guardar Cambios
            </button>
          </form>
        </div>
      )}
      {!reminder && !loading && error === null && (
        <div>Recordatorio no encontrado.</div>
      )}
    </>
  );
};

export default EditReminder;
