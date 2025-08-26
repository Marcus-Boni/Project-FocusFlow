-- SCRIPT DE VERIFICAÇÃO DAS TABELAS DE GOALS
-- Execute no SQL Editor do Supabase para verificar se as tabelas existem

-- 1. Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'goal%'
ORDER BY table_name;

-- 2. Verificar se os enum types foram criados
SELECT 
    typname as enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE typname LIKE 'goal_%'
GROUP BY typname
ORDER BY typname;

-- 3. Verificar se as colunas da tabela goals estão corretas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se o RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename LIKE 'goal%'
ORDER BY tablename;

-- 5. Verificar políticas RLS criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename LIKE 'goal%'
ORDER BY tablename, policyname;

-- 6. TESTE RÁPIDO: Tentar inserir uma meta de teste (substitua USER_ID_AQUI)
-- Descomente as linhas abaixo e substitua USER_ID_AQUI pelo seu ID de usuário
/*
INSERT INTO goals (
    user_id,
    title,
    description,
    category,
    priority,
    timeframe,
    status,
    specific_details,
    measurable_metrics,
    target_value,
    current_value,
    target_date,
    motivation_reason,
    identity_connection
) VALUES (
    'USER_ID_AQUI',  -- Substitua pelo ID do usuário autenticado
    'Meta de Teste',
    'Uma meta criada para testar o sistema',
    'learning',
    'medium',
    'monthly',
    'not_started',
    'Testar todas as funcionalidades do sistema de metas',
    'Completar 1 meta de teste com sucesso',
    1,
    0,
    CURRENT_DATE + INTERVAL '30 days',
    'Verificar se o sistema está funcionando corretamente',
    'Eu sou uma pessoa que testa sistemas antes de usar'
);
*/

-- 7. Se a inserção acima funcionar, verificar se foi criada
-- SELECT * FROM goals WHERE title = 'Meta de Teste';

-- 8. Limpar teste (descomente se executou o teste acima)
-- DELETE FROM goals WHERE title = 'Meta de Teste';
