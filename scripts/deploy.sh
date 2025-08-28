#!/bin/bash

# 🚀 Script de Deploy Automatizado para FocusFlow
# Execute este script para fazer deploy na Vercel

echo "🚀 Iniciando processo de deploy do FocusFlow..."

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

echo "📋 Verificando dependências..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🧪 Executando testes locais..."

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf .next

# Testar build local
echo "🔨 Testando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local. Corrija os erros antes de fazer deploy."
    exit 1
fi

echo "✅ Build local bem-sucedido!"

# Fazer lint
echo "🔍 Executando lint..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️ Avisos de lint encontrados. Continue? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

echo "📤 Fazendo commit das alterações..."

# Verificar se há alterações para commit
if [[ -n $(git status --porcelain) ]]; then
    git add .
    echo "💬 Digite a mensagem do commit:"
    read -r commit_message
    git commit -m "$commit_message"
    git push origin main
    echo "✅ Alterações enviadas para o GitHub"
else
    echo "ℹ️ Nenhuma alteração para commit"
fi

echo "🚀 Iniciando deploy na Vercel..."

# Deploy na Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo "📱 Seu app está disponível em:"
    echo "🔗 https://$(vercel inspect --scope=team)"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. ✅ Testar a aplicação em produção"
    echo "2. ✅ Configurar domínio personalizado (se necessário)"
    echo "3. ✅ Configurar Analytics da Vercel"
    echo "4. ✅ Configurar monitoramento de erros"
else
    echo "❌ Erro durante o deploy. Verifique os logs acima."
    exit 1
fi
