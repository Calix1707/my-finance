import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../hooks/use-auth";
import { errors } from "../assets/dictory";
import supabase, { User } from "../supabase-client";
import "../App.css";
import { FaGithub } from "react-icons/fa";

interface EyeProps {
    isOpen: boolean;
    onClick: () => void;
}

const Eye: React.FC<EyeProps> = ({ isOpen, onClick }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        onClick={onClick}
        style={{ cursor: "pointer" }}
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        });

        return () => subscription?.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        console.log("Iniciando handleSubmit con email:", email);

        try {
            const res = await login(email, password);
            console.log("Resultado de login:", res);

            if (!res.success) {
                setError(errors[res.message]);
                console.error("Error en el inicio de sesión:", errors[res.message]);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            console.log("Inicio de sesión exitoso, navegando a /home");
            navigate("/home");
            console.log("Navegación completada");
        } catch (error) {
            console.error("Error en handleSubmit:", error);
            setError("Error inesperado en el inicio de sesión.");
        }
    };

    const handleGitHubLoginClick = async () => {
        const { error: signInError } = await supabase.auth.signInWithOAuth({
            provider: "github",
        });

        if (signInError) {
            setError(signInError.message);
            return;
        }

        const { data: { user }, error: getUserError } = await supabase.auth.getUser();

        if (getUserError) {
            setError(getUserError.message);
            return;
        }

        if (user) {
            console.log("Datos del usuario a insertar:", {
                id: user.id,
                email: user.email,
                full_name: user?.user_metadata?.full_name,
                avatar_url: user?.user_metadata?.avatar_url,
            });

            const { error: userError } = await supabase.from("user").upsert({
                id: user.id,
                email: user.email,
                full_name: user?.user_metadata?.full_name,
                avatar_url: user?.user_metadata?.avatar_url,
            });

            if (userError) {
                console.error("Error inserting user data:", userError);
                setError(`Error al insertar los datos del usuario: ${userError.message}`);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
                navigate("/home");
            }
        } else {
            setError("Error al obtener los datos del usuario.");
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
                <label htmlFor="email">Correo electrónico:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="password">Contraseña:</label>
                <div className="password-input">
                    <input
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                    >
                        <Eye isOpen={passwordVisible} onClick={togglePasswordVisibility} />
                    </button>
                </div>
            </div>

            <div className="button-group">
                <button type="submit">Iniciar sesión</button>
            </div>

            <div className="github-button-group">
                <button type="button" onClick={handleGitHubLoginClick}>
                    <FaGithub style={{ marginRight: "8px" }} />
                    Iniciar sesión con GitHub
                </button>
            </div>

            <div className="register-link">
                <p>
                    ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
                </p>
            </div>

            {error && <p className="error-message">{error}</p>}
        </form>
    );
};

export default Login;