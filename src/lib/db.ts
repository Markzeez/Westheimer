// Database client - Supabase (replaces Mongoose)
import { createSupabaseServerClient } from "./supabase";

export async function connectDB() {
  // For Supabase, we just return the client
  // This is kept for compatibility with any existing code
  return createSupabaseServerClient();
}

// Supabase connection helper
export const db = createSupabaseServerClient();