@echo off
REM 🚀 Script de Deploy para Windows - FocusFlow
REM Execute este script para fazer deploy na Vercel

echo 🚀 Iniciando processo de deploy do FocusFlow...

REM Verificar se estamos na pasta correta
if not exist "package.json" (
    echo ❌ Erro: Execute este script na raiz do projeto
    exit /b 1
)

echo 📋 Verificando dependências...

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    exit /b 1
)

REM Verificar se o npm está funcionando
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm não encontrado. Verifique a instalação do Node.js.
    exit /b 1
)

echo 🧪 Executando testes locais...

REM Limpar build anterior
echo 🧹 Limpando build anterior...
if exist ".next" rmdir /s /q ".next"

REM Testar build local
echo 🔨 Testando build...
call npm run build

if errorlevel 1 (
    echo ❌ Erro no build local. Corrija os erros antes de fazer deploy.
    pause
    exit /b 1
)

echo ✅ Build local bem-sucedido!

REM Fazer lint
echo 🔍 Executando lint...
call npm run lint

if errorlevel 1 (
    echo ⚠️ Avisos de lint encontrados. Continue? (s/n)
    set /p response=
    if not "%response%"=="s" exit /b 1
)

echo 📤 Preparando para deploy...

REM Verificar se git está configurado
git status >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não configurado ou não está em um repositório git.
    echo 💡 Configure o git primeiro:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    echo    git remote add origin https://github.com/seu-usuario/focus-flow.git
    echo    git push -u origin main
    pause
    exit /b 1
)

REM Verificar se há alterações para commit
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo 📝 Há alterações não commitadas.
    set /p commit_message=💬 Digite a mensagem do commit: 
    git add .
    git commit -m "%commit_message%"
    git push origin main
    echo ✅ Alterações enviadas para o GitHub
) else (
    echo ℹ️ Nenhuma alteração para commit
)

echo 🚀 Próximo passo: Deploy Manual na Vercel

echo.
echo 📋 INSTRUÇÕES PARA DEPLOY:
echo.
echo 1. Acesse: https://vercel.com/dashboard
echo 2. Clique em "New Project"
echo 3. Conecte seu repositório GitHub
echo 4. Configure as variáveis de ambiente:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo 5. Clique em "Deploy"
echo.
echo 🔗 Para instalar o Vercel CLI (opcional):
echo    npm install -g vercel
echo    vercel --prod
echo.
echo 📖 Consulte o DEPLOY_GUIDE.md para instruções detalhadas.

pause
