import supabase from "../supabase-client";

async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        code: "01",
        message: error.message,
      };
    }

    return {
      success: true,
      code: "00",
      message: "Inicio de sesión exitoso",
      user: data.user, 
    };
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
