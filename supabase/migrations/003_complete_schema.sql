-- ============================================
-- STREET HAIR - SCHEMA COMPLETO CORRIGIDO
-- Execute tudo de uma vez para zerar e recriar
-- ============================================

-- ============================================
-- 1. REMOVER TUDO (Reset completo)
-- ============================================

-- Remover triggers primeiro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.check_is_admin(UUID) CASCADE;

-- Remover tabelas (limpa dados e políticas)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS professionals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 2. CRIAR TABELAS
-- ============================================

-- Profiles (extensão dos usuários do Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'admin'
  notification_preferences JSONB DEFAULT '{"reminders": true, "promotions": false, "news": true}'
);

-- Profissionais (barbeiros)
CREATE TABLE professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT true,
  specialties TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'barber'
);

-- Serviços oferecidos
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,              -- em centavos
  original_price INTEGER,              -- em centavos (desconto)
  popular BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'individual',  -- 'individual', 'combo'
  duration_minutes INTEGER DEFAULT 40,  -- duração em minutos
  active BOOLEAN DEFAULT true
);

-- Agendamentos
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id),
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  services TEXT[] NOT NULL,
  total_price INTEGER NOT NULL,        -- em centavos
  status TEXT DEFAULT 'confirmed',     -- 'confirmed', 'canceled', 'completed'
  notes TEXT
);

-- ============================================
-- 3. HABILITAR RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. POLITICAS RLS CORRETAS (Admin + Usuário)
-- ============================================

-- PROFILES --

-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- PROFESSIONALS --

-- Anyone can view active professionals
CREATE POLICY "Anyone can view active professionals" ON professionals
  FOR SELECT TO anon, authenticated USING (active = true);

-- Admin can manage professionals
CREATE POLICY "Admins can manage professionals" ON professionals
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- SERVICES --

-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT TO anon, authenticated USING (active = true);

-- Admin can manage services
CREATE POLICY "Admins can manage services" ON services
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- APPOINTMENTS --

-- Users can view own appointments
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can create own appointments
CREATE POLICY "Users can create own appointments" ON appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update own appointments (ex: cancelar)
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin can view all appointments
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin can update any appointment status (confirm, complete, cancel)
CREATE POLICY "Admins can update any appointment" ON appointments
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger: criar perfil automatico após sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para verificar se usuário é admin (útil para outras queries)
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. SEED DATA (Dados iniciais)
-- ============================================

-- Profissionais (trocando para id fixo permite recriar sem duplicar)
INSERT INTO professionals (id, name, bio, active, specialties, role)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Gabriel Barreto', 'Fundador & Barbeiro Master. Especialista em cortes modernos, degradê e desenhos. 8 anos de experiência e certificação em Londres pela London School of Barbering.', true, array['Corte', 'Degradê', 'Desenho'], 'owner'),
  ('a2222222-2222-2222-2222-222222222222', 'Renan Amaral', 'Co-fundador & Especialista em Barbas. Mestre na arte da barba tradicional e navalhada. Conhecido pelo atendimento personalizado.', true, array['Barba', 'Navalhada'], 'barber')
ON CONFLICT (id) DO NOTHING;

-- Serviços
INSERT INTO services (id, name, price, original_price, popular, category, duration_minutes, active)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Combo Estilo (Corte + Barba)', 5500, 6000, true, 'combo', 80, true),
  ('b2222222-2222-2222-2222-222222222222', 'Combo Premium (Corte + Barba + Sobrancelha)', 6500, 7500, false, 'combo', 120, true),
  ('b3333333-3333-3333-3333-333333333333', 'Combo Essencial (Corte + Sobrancelha)', 4500, 5000, false, 'combo', 60, true),
  ('b4444444-4444-4444-4444-444444444444', 'Corte navalhado', 4000, null, false, 'individual', 40, true),
  ('b5555555-5555-5555-5555-555555555555', 'Corte', 3500, null, false, 'individual', 40, true),
  ('b6666666-6666-6666-6666-666666666666', 'Barba', 2500, null, false, 'individual', 40, true),
  ('b7777777-7777-7777-7777-777777777777', 'Sobrancelha', 1500, null, false, 'individual', 30, true)
ON CONFLICT (id) DO NOTHING;
