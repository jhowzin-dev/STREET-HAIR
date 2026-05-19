-- ============================================
-- MIGRATION: 002_admin_policies.sql
-- Street Hair - Permissões de Administrador
-- ============================================

-- 1. Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RLS: Permite ao admin visualizar TODOS os agendamentos
DROP POLICY IF EXISTS "Admins can read all appointments" ON appointments;
CREATE POLICY "Admins can read all appointments" 
  ON appointments FOR SELECT TO authenticated 
  USING (public.check_is_admin(auth.uid()));

-- 3. RLS: Permite ao admin atualizar status de qualquer agendamento
DROP POLICY IF EXISTS "Admins can update any appointment status" ON appointments;
CREATE POLICY "Admins can update any appointment status" 
  ON appointments FOR UPDATE TO authenticated 
  USING (public.check_is_admin(auth.uid()));

-- 4. RLS: Permite ao admin ver todos os perfis (para ver nomes dos clientes)
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles" 
  ON profiles FOR SELECT TO authenticated 
  USING (public.check_is_admin(auth.uid()));

-- 5. RLS: Permite ao admin ver todos os profissionais e serviços
DROP POLICY IF EXISTS "Admins can read all professionals" ON professionals;
CREATE POLICY "Admins can read all professionals"
  ON professionals FOR SELECT TO authenticated
  USING (public.check_is_admin(auth.uid()));
