-- ============================================================
-- COLLADO EUROPA CONECTA - Esquema Supabase
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
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
  created_at timestamp with time zone default now()
);

alter table public.messages enable row level security;

create policy "Messages are viewable by authenticated users"
  on public.messages for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert messages"
  on public.messages for insert with check (auth.uid() = user_id);

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
  created_at timestamp with time zone default now()
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

-- =================== SAMPLE DATA ===================
-- Uncomment to insert sample news (run after creating an admin user)
-- insert into public.news (title, content, source, category) values
-- ('Collado refuerza lazos con dominicanos en Europa',
--  'El candidato presidencial David Collado se reunió con representantes de la comunidad dominicana en España.',
--  'El Caribe', 'Política'),
-- ('Nueva propuesta para dominicanos en el exterior',
--  'David Collado presentó un proyecto que beneficiaría a más de 2 millones de dominicanos en el extranjero.',
--  'Listín Diario', 'Legislación');
