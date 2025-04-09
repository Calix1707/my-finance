export interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  desc: string;
  category: string;
  type: "income" | "expense";
  date: string;
  percentage?: string;
  time_filter: string;
}

export interface User {
  id: string;
  email?: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface Reminder {
  id: number;
  is_active: boolean | null;
  created_at: string;
  created_by: number | null;
  last_check: string | null;
  next_check: string | null;
  schema: string | null;
  category_id: number | null;
  label: string | null;
  reminder_datetime: string | null;
}

interface CategoryColors {
  Regalos?: string;
  Salario?: string;
  Comida?: string;
  Inversiones?: string;
  [key: string]: string | undefined;
}
