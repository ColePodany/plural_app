import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://kofrehjyjdzfkzshncjd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZnJlaGp5amR6Zmt6c2huY2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTEwNzEsImV4cCI6MjA4OTI4NzA3MX0.ZUDNONNgAYA6IfaIMCEassrsssUPdtx3lVamye6UwEA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});