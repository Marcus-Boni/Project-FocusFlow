# 🎯 FocusFlow - Smart Study Tracker

FocusFlow é um aplicativo moderno de rastreamento de estudos projetado especificamente para engenheiros de software e estudantes de tecnologia. Combina técnicas baseadas em neurociência com gamificação para maximizar o aprendizado e construir hábitos de estudo consistentes.

## ✨ Funcionalidades

### 🚀 MVP Implementado
- **Autenticação Completa**: Login/cadastro com email e OAuth (GitHub)
- **Dashboard Inteligente**: Visão geral do progresso e estatísticas
- **Timer Pomodoro**: Sessões de foco e pausas otimizadas
- **Gestão de Áreas de Estudo**: CRUD completo para organizar matérias
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Modo Dark/Light**: Alternância entre temas
- **Proteção de Rotas**: Middleware de autenticação

### 🧠 Baseado em Neurociência
- **Técnica Pomodoro**: Ciclos de 25 min de foco + 5 min de pausa
- **Pausas Inteligentes**: Pausa longa a cada 4 ciclos
- **Motivação Diária**: Citações inspiradoras rotativas
- **Gamificação**: Sistema de streaks e conquistas (em desenvolvimento)

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript (strict mode)
- **Estilização**: TailwindCSS + Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **Estado Global**: Zustand
- **Ícones**: Lucide React
- **Temas**: next-themes

## 🚦 Começando

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o Repositório
```bash
git clone [seu-repo]
cd focus-flow
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aguarde a configuração completa

#### 3.2 Configure o Banco de Dados
1. No dashboard do Supabase, vá para "SQL Editor"
2. Execute o script `database-schema.sql` (localizado na raiz do projeto)
3. Isso criará todas as tabelas, políticas RLS e triggers necessários

#### 3.3 Configure Autenticação OAuth (Opcional)
1. Vá para "Authentication" > "Providers"
2. Habilite GitHub OAuth
3. Configure as URLs de callback:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Configure Variáveis de Ambiente
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 5. Execute o Projeto
```bash
npm run dev
```

Acesse `http://localhost:3000` para ver a aplicação rodando!

## 📁 Estrutura do Projeto

```
src/
├── app/                     # Rotas do Next.js
│   ├── (auth)/             # Rotas de autenticação
│   │   ├── login/          # Página de login
│   │   ├── register/       # Página de cadastro
│   │   └── callback/       # Callback OAuth
│   ├── (dashboard)/        # Rotas protegidas
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── timer/          # Timer Pomodoro
│   │   └── study-areas/    # Gestão de áreas de estudo
│   ├── layout.tsx          # Layout raiz
│   └── page.tsx            # Landing page
├── components/             # Componentes React
│   ├── shared/             # Componentes compartilhados
│   └── ui/                 # Componentes do Shadcn/UI
├── lib/                    # Utilitários e configurações
│   ├── hooks/              # Hooks personalizados
│   ├── supabase.ts         # Cliente Supabase
│   └── utils.ts            # Funções auxiliares
└── stores/                 # Estado global (Zustand)
    ├── useUserStore.ts     # Estado do usuário
    └── useSessionStore.ts  # Estado das sessões
```

## 🎨 Design System

### Cores Principais
- **Primary**: Azul (#3B82F6) - Ações principais
- **Secondary**: Cinza neutro - Ações secundárias
- **Accent**: Verde (#10B981) - Destaques
- **Destructive**: Vermelho (#EF4444) - Ações perigosas

### Componentes
- Baseados no Shadcn/UI para consistência
- Design minimalista e funcional
- Totalmente responsivo (mobile-first)
- Acessibilidade seguindo WCAG

## 🔒 Segurança

- **Row Level Security (RLS)**: Proteção completa no Supabase
- **Middleware de Auth**: Proteção de rotas sensíveis
- **Validação Client/Server**: Dupla validação de dados
- **HTTPS**: Obrigatório em produção

## 📊 Funcionalidades Futuras

### 🧠 Neurociência Avançada
- [ ] **Spaced Repetition**: Sistema de revisão espaçada
- [ ] **Active Recall**: Mecânicas de recordação ativa
- [ ] **Forgetting Curve**: Algoritmo baseado na curva do esquecimento

### 🎮 Gamificação
- [ ] **Sistema de XP**: Pontos por sessões completadas
- [ ] **Achievements**: Conquistas por marcos alcançados
- [ ] **Leaderboards**: Rankings semanais/mensais
- [ ] **Badges**: Distintivos por consistência

### 📈 Analytics Avançados
- [ ] **Heatmap de Atividade**: Estilo GitHub
- [ ] **Relatórios Semanais**: Insights automáticos
- [ ] **Padrões de Estudo**: Identificação de horários produtivos
- [ ] **Comparações**: Progresso mês a mês

### 🤝 Social Features
- [ ] **Grupos de Estudo**: Comunidades por tecnologia
- [ ] **Study Buddies**: Sistema de parceiros de estudo
- [ ] **Compartilhamento**: Posts de conquistas
- [ ] **Mentoria**: Conexão com desenvolvedores sêniores

## 🧪 Testing

```bash
# Executar testes (quando implementados)
npm test

# Executar testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

### Q1 2025
- [ ] Sistema de revisão espaçada
- [ ] Analytics básicos
- [ ] PWA (Progressive Web App)
- [ ] Notificações push

### Q2 2025
- [ ] Modo offline
- [ ] Integração com calendários
- [ ] API pública
- [ ] Mobile apps (React Native)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 💡 Inspiração

FocusFlow foi inspirado em:
- **Forest**: Gamificação de foco
- **Notion**: Design clean e funcional
- **GitHub**: Sistema de contribuições
- **Pesquisas em Neurociência**: Técnicas de aprendizado eficaz

---

**Desenvolvido com ❤️ por Marcus Boni**