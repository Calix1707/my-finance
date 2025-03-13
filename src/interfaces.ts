// interfaces.ts
export interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  percentage: number;
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