-- ============================================================
-- COLLADO EUROPA CONECTA - Actualización de Esquema
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- 1. Modificar tabla MESSAGES
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text,
ADD COLUMN IF NOT EXISTS is_ai boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS read_by uuid[] DEFAULT '{}';

-- 2. Modificar tabla EVENTS (Nuevos campos)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS contact_info text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';

-- 3. Crear Bucket de Storage (solo si no se ha creado por UI)
insert into storage.buckets (id, name, public) 
values ('chat_media', 'chat_media', true)
on conflict (id) do nothing;

create policy "Media public access"
  on storage.objects for select
  using ( bucket_id = 'chat_media' );

create policy "Auth users can upload media"
  on storage.objects for insert
  with check ( bucket_id = 'chat_media' and auth.role() = 'authenticated' );

-- 4. Creación de una función (Cron-like) para borrar media vieja
-- (Aviso: Supabase pg_cron requiere extensíon pg_cron, lo simulamos con una función que puede ser llamada vía API o Edge Functions,
-- pero a nivel de SQL dejamos la lógica de borrado).

CREATE OR REPLACE FUNCTION delete_old_messages_and_media()
RETURNS void AS $$
BEGIN
  -- Borra los mensajes más antiguos de 7 días (si se quisiera)
  DELETE FROM public.messages 
  WHERE created_at < NOW() - INTERVAL '7 days' 
    AND media_url IS NOT NULL;
    
  -- Nota: Para borrar los archivos físicos del Storage se necesita un Edge Function o Trigger externo
  -- que haga la petición a la API de Storage.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
