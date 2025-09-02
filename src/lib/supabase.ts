import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export interface SupabaseAITool {
  id: string;
  name: string;
  description: string;
  category: string;
  license: string;
  usability: number;
  features: string[];
  tags: string[];
  languages: string[];
  link: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// Database types
export type Database = {
  public: {
    Tables: {
      ai_tools: {
        Row: SupabaseAITool;
        Insert: Omit<SupabaseAITool, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SupabaseAITool, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};