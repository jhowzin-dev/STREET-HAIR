-- ============================================================
-- STREET HAIR - CLEANUP DE DUPLICADOS
-- Executar após aplicar 003_complete_schema.sql
-- ============================================================

-- 1. Identificar profissionais duplicados (mesmo nome)
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
  FROM professionals
)
DELETE FROM professionals
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 2. Identificar serviços duplicados (mesmo nome)
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
  FROM services
)
DELETE FROM services
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 3. Verificar integridade: garantir que todos os professionals/services tenham ao menos 1 registro
-- (isso é apenas uma query de verificação, não altera dados)
SELECT 'Profissionais:' as table_name, COUNT(*) as total FROM professionals
UNION ALL
SELECT 'Serviços:', COUNT(*) FROM services;
