// Importa a função de criação do client Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Cria o client com a URL e a chave fornecidas
export const supabase = createClient(
  'https://eqqeykejcedoddtuvwri.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWV5a2VqY2Vkb2RkdHV2d3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTE4NDgsImV4cCI6MjA4NzY4Nzg0OH0.Lq32WZRaUEvaBztEnevRkpfU6sxDBBJQnM8QELwiJ8w'
)
    