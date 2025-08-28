-- ============================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA AVATARES
-- Execute se você já criou o bucket antes
-- ============================================

-- Remove as políticas antigas
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Cria as políticas corrigidas
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verificar as políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';
