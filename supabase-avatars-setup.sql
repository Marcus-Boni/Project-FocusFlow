-- ============================================
-- SETUP COMPLETO DO BUCKET DE AVATARES
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar o bucket 'avatars' (público para visualização)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- 2. Habilitar RLS na tabela objects (se ainda não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Política: Permitir visualização pública de avatares
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'avatars');

-- 4. Política: Usuários podem fazer upload de seus próprios avatares
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Política: Usuários podem atualizar seus próprios avatares
CREATE POLICY "Users can update their own avatar" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Política: Usuários podem deletar seus próprios avatares
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICAÇÃO (opcional)
-- Execute estas queries para confirmar a configuração
-- ============================================

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';
