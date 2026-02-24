-- ============================================================
-- COLLADO EUROPA CONECTA - Esquema Supabase (COMPLETO Y ACTUALIZADO)
-- Copia todo este texto y pégalo en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- =================== PROFILES ===================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  country text,
  city text,
  role text default 'member',
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, country, city)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'city'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Usa 'or replace' y elimina el trigger previo por si ya existía
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =================== MESSAGES ===================
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  room text not null default 'General',
  user_id uuid references auth.users on delete cascade not null,
  user_name text,
  created_at timestamp with time zone default now(),
  -- Nuevos campos de Chat (Multimedia e IA) --
  media_url text,
  media_type text,
  is_ai boolean default false,
  read_by uuid[] default '{}'
);

alter table public.messages enable row level security;

create policy "Messages are viewable by authenticated users"
  on public.messages for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert messages"
  on public.messages for insert with check (auth.uid() = user_id OR is_ai = true);

create policy "Users can delete their own messages"
  on public.messages for delete using (auth.uid() = user_id);

create index if not exists messages_room_idx on public.messages(room);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

-- =================== NEWS ===================
create table if not exists public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  source text,
  image_url text,
  category text default 'General',
  author_id uuid references auth.users on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.news enable row level security;

create policy "News are viewable by authenticated users"
  on public.news for select using (auth.role() = 'authenticated');

create policy "Admins can insert news"
  on public.news for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =================== EVENTS ===================
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  country text,
  event_date date not null,
  event_time time,
  attendees integer default 0,
  organizer_id uuid references auth.users on delete set null,
  created_at timestamp with time zone default now(),
  -- Nuevos campos de Eventos --
  city text,
  contact_info text,
  status text default 'approved'
);

alter table public.events enable row level security;

create policy "Events are viewable by authenticated users"
  on public.events for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create events"
  on public.events for insert with check (auth.role() = 'authenticated');

create policy "Organizers can update their events"
  on public.events for update using (auth.uid() = organizer_id);

-- =================== EVENT ATTENDEES ===================
create table if not exists public.event_attendees (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events on delete cascade,
  user_id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default now(),
  unique(event_id, user_id)
);

alter table public.event_attendees enable row level security;

create policy "Attendees viewable by authenticated"
  on public.event_attendees for select using (auth.role() = 'authenticated');

create policy "Users can register to events"
  on public.event_attendees for insert with check (auth.uid() = user_id);

create policy "Users can unregister from events"
  on public.event_attendees for delete using (auth.uid() = user_id);

-- =================== REALTIME ===================
-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- =================== STORAGE MEDIA ===================
insert into storage.buckets (id, name, public) 
values ('chat_media', 'chat_media', true)
on conflict (id) do nothing;

create policy "Media public access"
  on storage.objects for select
  using ( bucket_id = 'chat_media' );

create policy "Auth users can upload media"
  on storage.objects for insert
  with check ( bucket_id = 'chat_media' and auth.role() = 'authenticated' );

-- =================== FUNCIÓN LIMPIEZA ===================
CREATE OR REPLACE FUNCTION delete_old_messages_and_media()
RETURNS void AS $$
BEGIN
  -- Borra los mensajes más antiguos de 7 días que tengan contenido multimedia
  DELETE FROM public.messages 
  WHERE created_at < NOW() - INTERVAL '7 days' 
    AND media_url IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
