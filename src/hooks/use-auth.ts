import supabase from "../supabase-client";

async function login(email: string, password: string) {
  let res = {
    success: true,
    code: "00",
    message: "",
  };

  try {
    const { error } = await supabase.auth.signInWithPassword({
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

    return res;
  } catch (error) {
    return {
      success: false,
      code: "02",
      message: "Error desconocido",
    };
  }
}

export { login };
