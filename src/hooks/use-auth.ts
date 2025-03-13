import supabase from "../supabase-client";

async function login(email: string, password: string) {
  console.log("Función login llamada con:", { email, password });
  try {
    const { data, error } = await supabase.auth
      .signInWithPassword({
        email,
        password,
      })
      .catch((error) => {
        console.error("Error en supabase.auth.signInWithPassword:", error);
        return { data: null, error: error };
      })
      .finally(() => {
        console.log("signInWithPassword finally ejecutado");
      });

    console.log("Resultado de signInWithPassword:", { data, error });

    if (error) {
      return {
        success: false,
        code: "01",
        message: error.message,
      };
    }

    if (data && data.user) {
      return {
        success: true,
        code: "00",
        message: "Inicio de sesión exitoso",
        user: data.user,
      };
    } else {
      return {
        success: false,
        code: "03",
        message: "Error al obtener los datos del usuario.",
      };
    }
  } catch (error) {
    console.error("Error desconocido:", error);
    return {
      success: false,
      code: "02",
      message: "Error desconocido",
    };
  }
}

export { login };