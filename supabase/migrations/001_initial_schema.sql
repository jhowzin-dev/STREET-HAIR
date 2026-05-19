-- ============================================
-- STREET HAIR - SCHEMA INICIAL
-- ============================================

-- Profiles (extensão dos usuários do Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  full_name text,
  phone text,
  avatar_url text,
  role text default 'user', -- 'user', 'admin'
  notification_preferences jsonb default '{"reminders": true, "promotions": false, "news": true}'
);

-- Profissionais (barbeiros)
create table if not exists professionals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  image_url text,
  bio text,
  active boolean default true,
  specialties text[] default '{}',
  role text default 'barber'
);

-- Serviços oferecidos
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  price integer not null,              -- em centavos
  original_price integer,              -- em centavos (desconto)
  popular boolean default false,
  category text default 'individual',  -- 'individual', 'combo'
  duration_minutes integer default 40,  -- duração em minutos
  active boolean default true
);

-- Agendamentos
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  user_id uuid references auth.users(id) on delete cascade,
  professional_id uuid references professionals(id),
  appointment_date date not null,
  appointment_time text not null,
  services text[] not null,
  total_price integer not null,        -- em centavos
  status text default 'confirmed',     -- 'confirmed', 'canceled', 'completed'
  notes text
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table profiles enable row level security;
alter table professionals enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

-- Profiles: cada usuário só vê/edita o próprio
-- Nota: insert por trigger (abaixo), update/delete manual
-- Users podem ver o próprio profile
-- insert e update via função de trigger padrão

create policy "Users can view own profile" on profiles
  for select to authenticated using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Professionals: todos podem ver os ativos
create policy "Anyone can view active professionals" on professionals
  for select to anon, authenticated using (active = true);

-- Services: todos podem ver os ativos
create policy "Anyone can view active services" on services
  for select to anon, authenticated using (active = true);

-- Appointments: usuário só vê os seus
create policy "Users can view own appointments" on appointments
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can create own appointments" on appointments
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update own appointments" on appointments
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Trigger: atualizar updated_at automaticamente

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- Trigger: criar perfil automatico após sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- SEED DATA (dados iniciais)
-- ============================================

-- Profissionais
insert into professionals (id, name, bio, active, specialties, role)
values
  ('a1111111-1111-1111-1111-111111111111', 'Gabriel Barreto', 'Fundador & Barbeiro Master. Especialista em cortes modernos, degradê e desenhos. 8 anos de experiência e certificação em Londres pela London School of Barbering.', true, array['Corte', 'Degradê', 'Desenho'], 'owner'),
  ('a2222222-2222-2222-2222-222222222222', 'Renan Amaral', 'Co-fundador & Especialista em Barbas. Mestre na arte da barba tradicional e navalhada. Conhecido pelo atendimento personalizado.', true, array['Barba', 'Navalhada'], 'barber')
on conflict (id) do nothing;

-- Serviços
insert into services (id, name, price, original_price, popular, category, duration_minutes, active)
values
  ('b1111111-1111-1111-1111-111111111111', 'Combo Estilo (Corte + Barba)', 5500, 6000, true, 'combo', 80, true),
  ('b2222222-2222-2222-2222-222222222222', 'Combo Premium (Corte + Barba + Sobrancelha)', 6500, 7500, false, 'combo', 120, true),
  ('b3333333-3333-3333-3333-333333333333', 'Combo Essencial (Corte + Sobrancelha)', 4500, 5000, false, 'combo', 60, true),
  ('b4444444-4444-4444-4444-444444444444', 'Corte navalhado', 4000, null, false, 'individual', 40, true),
  ('b5555555-5555-5555-5555-555555555555', 'Corte', 3500, null, false, 'individual', 40, true),
  ('b6666666-6666-6666-6666-666666666666', 'Barba', 2500, null, false, 'individual', 40, true),
  ('b7777777-7777-7777-7777-777777777777', 'Sobrancelha', 1500, null, false, 'individual', 30, true)
on conflict (id) do nothing;
