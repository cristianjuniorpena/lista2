import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://eqqeykejcedoddtuvwri.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWV5a2VqY2Vkb2RkdHV2d3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTE4NDgsImV4cCI6MjA4NzY4Nzg0OH0.Lq32WZRaUEvaBztEnevRkpfU6sxDBBJQnM8QELwiJ8w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)