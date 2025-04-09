import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabase-client";
import { Reminder } from "../interfaces";
import "../styles/App.css";
import useUser from "../hooks/useUser";
import "../styles/Reminder.css";

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("reminder")
            .select("*")
            .eq("user_id", user.id)
            .order("reminder_datetime", { ascending: true })
            .returns<Reminder[]>();

          if (error) {
            console.error("Error fetching reminders:", error);
          } else {
            setReminders(data || []);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchReminders();

    const intervalId = setInterval(checkExpiredReminders, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  const checkExpiredReminders = () => {
    const now = new Date();
    reminders.forEach(async (reminder) => {
      if (reminder.reminder_datetime) {
        const reminderTime = new Date(reminder.reminder_datetime);
        const expirationTime = new Date(reminderTime.getTime() + 30 * 60000);

        if (now > expirationTime && reminder.is_active) {
          console.log(
            `Eliminando recordatorio expirado: ${reminder.label} (ID: ${reminder.id})`
          );
          await handleDeleteReminder(reminder.id);
        }
      }
    });
  };

  const handleCheckboxChange = async (
    reminderId: number,
    isChecked: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("reminder")
        .update({ is_active: isChecked })
        .eq("id", reminderId);

      if (error) {
        console.error("Error updating reminder status:", error);
      } else {
        setReminders((prevReminders) =>
          prevReminders.map((reminder) =>
            reminder.id === reminderId
              ? { ...reminder, is_active: isChecked }
              : reminder
          )
        );
      }
    } catch (err) {
      console.error("Error updating reminder status:", err);
    }
  };

  const handleDeleteReminder = async (reminderId: number) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este recordatorio?")
    ) {
      try {
        const { error } = await supabase
          .from("reminder")
          .delete()
          .eq("id", reminderId);

        if (error) {
          console.error("Error deleting reminder:", error);
          alert("Ocurrió un error al eliminar el recordatorio.");
        } else {
          setReminders((prevReminders) =>
            prevReminders.filter((reminder) => reminder.id !== reminderId)
          );
        }
      } catch (err) {
        console.error("Error deleting reminder:", err);
        alert("Ocurrió un error inesperado al eliminar el recordatorio.");
      }
    }
  };

  return (
    <div className="reminders-container">
      <div className="header-container">
        <button onClick={() => navigate("/home")}>Atrás</button>
        <h2>Recordatorios</h2>
      </div>
      <Link to="/add-reminder" className="create-button">
        + Crear
      </Link>
      <ul className="reminders-list">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="reminder-item">
            <div className="reminder-details">
              <span className="reminder-name">{reminder.label}</span>
              {reminder.reminder_datetime && (
                <div className="reminder-datetime">
                  <span>
                    {new Date(reminder.reminder_datetime).toLocaleDateString()}
                  </span>{" "}
                  <span>
                    {new Date(reminder.reminder_datetime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="reminder-actions">
              <Link
                to={`/edit-reminder/${reminder.id}`}
                className="edit-button"
              >
                Editar
              </Link>
              <button
                onClick={() => handleDeleteReminder(reminder.id)}
                className="delete-button"
              >
                Eliminar
              </button>
            </div>
            <input
              type="checkbox"
              checked={reminder.is_active ?? false}
              onChange={(e) =>
                handleCheckboxChange(reminder.id, e.target.checked)
              }
              className="reminder-checkbox"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reminders;
