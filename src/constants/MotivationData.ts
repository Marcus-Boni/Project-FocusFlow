
export interface StudyTip {
  id: string
  title: string
  content: string
  category: 'focus' | 'memory' | 'productivity' | 'break' | 'motivation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  neuroscience?: string
}

export interface NeuroscienceInsight {
  id: string
  title: string
  content: string
  category: 'memory' | 'attention' | 'learning' | 'stress' | 'sleep' | 'motivation'
  source: string
  practical_application: string
}

// Base de dados local de dicas de estudo baseadas em neurociência
export const STUDY_TIPS: StudyTip[] = [
  {
    id: 'tip_001',
    title: 'Técnica Pomodoro',
    content: 'Estude por 25 minutos com foco total, depois faça uma pausa de 5 minutos.',
    category: 'focus',
    difficulty: 'beginner',
    neuroscience: 'O córtex pré-frontal mantém melhor concentração em períodos curtos, evitando fadiga mental.'
  },
  {
    id: 'tip_002',
    title: 'Repetição Espaçada',
    content: 'Revise o material em intervalos crescentes: 1 dia, 3 dias, 1 semana, 2 semanas.',
    category: 'memory',
    difficulty: 'intermediate',
    neuroscience: 'A curva do esquecimento de Ebbinghaus mostra que a repetição espaçada fortalece as sinapses.'
  },
  {
    id: 'tip_003',
    title: 'Técnica Feynman',
    content: 'Explique o conceito em palavras simples, como se estivesse ensinando uma criança.',
    category: 'memory',
    difficulty: 'advanced',
    neuroscience: 'Ensinar ativa múltiplas áreas cerebrais, criando conexões neurais mais fortes.'
  },
  {
    id: 'tip_004',
    title: 'Ambiente de Estudo',
    content: 'Mantenha o ambiente sempre limpo e organize os materiais antes de começar.',
    category: 'productivity',
    difficulty: 'beginner',
    neuroscience: 'Um ambiente organizado reduz a carga cognitiva, liberando recursos mentais para o aprendizado.'
  },
  {
    id: 'tip_005',
    title: 'Pausas Ativas',
    content: 'Durante as pausas, faça exercícios leves ou caminhe em vez de usar o celular.',
    category: 'break',
    difficulty: 'beginner',
    neuroscience: 'O exercício aumenta o BDNF (fator neurotrófico), promovendo crescimento de novos neurônios.'
  },
  {
    id: 'tip_006',
    title: 'Mapas Mentais',
    content: 'Crie conexões visuais entre conceitos usando cores, símbolos e hierarquias.',
    category: 'memory',
    difficulty: 'intermediate',
    neuroscience: 'O processamento visual ativa o lobo occipital, criando múltiplas vias de recuperação da memória.'
  },
  {
    id: 'tip_007',
    title: 'Teste de Recuperação',
    content: 'Teste seu conhecimento sem consultar o material - use flashcards ou quiz.',
    category: 'memory',
    difficulty: 'intermediate',
    neuroscience: 'O esforço de recuperação fortalece as conexões sinápticas mais que a releitura passiva.'
  },
  {
    id: 'tip_008',
    title: 'Intercalação de Tópicos',
    content: 'Alterne entre diferentes tópicos em uma sessão de estudo.',
    category: 'productivity',
    difficulty: 'advanced',
    neuroscience: 'A intercalação melhora a discriminação e transferência de conhecimento entre domínios.'
  },
  {
    id: 'tip_009',
    title: 'Hidratação e Glicose',
    content: 'Mantenha-se hidratado e mantenha níveis estáveis de glicose com lanches saudáveis.',
    category: 'productivity',
    difficulty: 'beginner',
    neuroscience: 'O cérebro consome 20% da energia do corpo - desidratação e hipoglicemia afetam a cognição.'
  },
  {
    id: 'tip_010',
    title: 'Sleep and Learning',
    content: 'Durma 7-9 horas por noite - o sono consolida as memórias formadas durante o dia.',
    category: 'memory',
    difficulty: 'beginner',
    neuroscience: 'Durante o sono REM, o hipocampo transfere informações para o córtex para armazenamento de longo prazo.'
  },
  {
    id: 'tip_011',
    title: 'Pré-leitura e Preview',
    content: 'Faça uma leitura rápida do conteúdo antes de estudar profundamente para criar um mapa mental inicial.',
    category: 'memory',
    difficulty: 'beginner',
    neuroscience: 'A ativação prévia de redes neurais relevantes facilita o encoding quando você estuda em profundidade.'
  },
  {
    id: 'tip_012',
    title: 'Ritual de Início',
    content: 'Estabeleça um pequeno ritual (ex.: organizar a mesa, 2 respirações profundas) para sinalizar o começo da sessão.',
    category: 'focus',
    difficulty: 'beginner',
    neuroscience: 'Sinais contextuais funcionam como pistas de recuperação, ajudando a entrar em estado de concentração mais rápido.'
  },

  {
    id: 'tip_013',
    title: 'Elimine Notificações',
    content: 'Desative notificações e use modos “não perturbe” durante sessões de estudo.',
    category: 'focus',
    difficulty: 'beginner',
    neuroscience: 'Reduzir estímulos irrelevantes melhora o gating sensorial e a manutenção da atenção sustentada.'
  },
  {
    id: 'tip_014',
    title: 'Som Ambiente Controlado',
    content: 'Experimente ruído branco leve ou playlists sem letras para mascarar distrações.',
    category: 'focus',
    difficulty: 'intermediate',
    neuroscience: 'Sons consistentes podem reduzir distrações inesperadas e ajudar na sincronização atencional.'
  },
  {
    id: 'tip_015',
    title: 'Anotações Ativas',
    content: 'Faça anotações resumidas e transforme-as em questões que você possa responder depois.',
    category: 'memory',
    difficulty: 'beginner',
    neuroscience: 'Anotar de forma ativa promove a codificação semântica, aumentando a probabilidade de recuperação.'
  },
  {
    id: 'tip_016',
    title: 'Reflexão Pós-Sessão',
    content: 'Reserve 5 minutos após estudar para resumir aprendizados e pontos de dúvida.',
    category: 'memory',
    difficulty: 'intermediate',
    neuroscience: 'A metacognição melhora consolidação e orienta futuras sessões de estudo com feedback interno.'
  },
  {
    id: 'tip_017',
    title: 'Micro-objetivos',
    content: 'Divida grandes metas em micro-tarefas acionáveis e celebrem pequenas vitórias.',
    category: 'motivation',
    difficulty: 'beginner',
    neuroscience: 'Metas pequenas geram liberação de dopamina frequente, sustentando a motivação.'
  },
  {
    id: 'tip_018',
    title: 'Pair Programming / Study Buddy',
    content: 'Estude ou programe com alguém para trocar feedback e manter responsabilidade mútua.',
    category: 'productivity',
    difficulty: 'intermediate',
    neuroscience: 'Interação social ativa redes de recompensa e facilita aprendizado por modelagem e correção de erros.'
  },
  {
    id: 'tip_019',
    title: 'Periodização de Estudo',
    content: 'Alterne dias de alta intensidade com dias de revisão leve e recuperação.',
    category: 'productivity',
    difficulty: 'advanced',
    neuroscience: 'Ciclar intensidade previne fadiga cognitiva e otimiza consolidação entre sessões intensas.'
  },
  {
    id: 'tip_020',
    title: 'Desafios Incrementais',
    content: 'Aumente gradualmente a dificuldade dos exercícios para forçar adaptação sem frustração.',
    category: 'productivity',
    difficulty: 'advanced',
    neuroscience: 'Dificuldades desejáveis promovem aprendizagem robusta por reforçar a diferenciação de padrões.'
  },
  {
    id: 'tip_021',
    title: 'Recuperação Ativa',
    content: 'Use pausas para atividades que reduzam estresse (respiração, alongamento) em vez de telas.',
    category: 'break',
    difficulty: 'beginner',
    neuroscience: 'Atividades de recuperação reduzem cortisol e restauram função executiva do córtex pré-frontal.'
  },
  {
    id: 'tip_022',
    title: 'Autoavaliação Regular',
    content: 'Agende testes periódicos para medir progresso e ajustar prioridades de estudo.',
    category: 'memory',
    difficulty: 'intermediate',
    neuroscience: 'Feedback informativo e recuperação ativa ajudam a atualizar representações mentais e fortalecer memória.'
  }
]

// Base de dados local de insights de neurociência
export const NEUROSCIENCE_INSIGHTS: NeuroscienceInsight[] = [
  {
    id: 'neuro_001',
    title: 'Neuroplasticidade e Prática Deliberada',
    content: 'O cérebro pode reorganizar suas conexões até os 90+ anos através da prática deliberada.',
    category: 'learning',
    source: 'Dr. Michael Merzenich, University of California',
    practical_application: 'Pratique habilidades específicas com foco e feedback constante para maximizar a neuroplasticidade.'
  },
  {
    id: 'neuro_002',
    title: 'Default Mode Network',
    content: 'Durante pausas, o cérebro ativa a Rede do Modo Padrão, consolidando memórias e gerando insights.',
    category: 'memory',
    source: 'Dr. Marcus Raichle, Washington University',
    practical_application: 'Faça pausas sem estímulos externos (sem celular/TV) para permitir consolidação natural.'
  },
  {
    id: 'neuro_003',
    title: 'Atenção Dividida e Multitasking',
    content: 'O cérebro não pode realmente fazer multitasking - alterna rapidamente entre tarefas, perdendo eficiência.',
    category: 'attention',
    source: 'Dr. Daniel Levitin, McGill University',
    practical_application: 'Foque em uma tarefa por vez e elimine distrações do ambiente de estudo.'
  },
  {
    id: 'neuro_004',
    title: 'Hormônios do Stress e Memória',
    content: 'Níveis moderados de cortisol melhoram a memória, mas stress crônico prejudica o hipocampo.',
    category: 'stress',
    source: 'Dr. Robert Sapolsky, Stanford University',
    practical_application: 'Use técnicas de respiração e mindfulness para manter stress em níveis ótimos.'
  },
  {
    id: 'neuro_005',
    title: 'Mirror Neurons e Aprendizado Social',
    content: 'Neurônios-espelho disparam quando observamos outros executando uma ação, facilitando aprendizado por imitação.',
    category: 'learning',
    source: 'Dr. Giacomo Rizzolatti, University of Parma',
    practical_application: 'Aprenda assistindo experts codificando, tutoriais em vídeo e pair programming.'
  },
  {
    id: 'neuro_006',
    title: 'Dopamina e Sistema de Recompensa',
    content: 'A dopamina é liberada na antecipação da recompensa, não apenas ao recebê-la.',
    category: 'motivation',
    source: 'Dr. Wolfram Schultz, University of Cambridge',
    practical_application: 'Defina micro-objetivos com recompensas claras para manter motivação alta.'
  },
  {
    id: 'neuro_007',
    title: 'Circadian Rhythms e Performance Cognitiva',
    content: 'A performance cognitiva varia ao longo do dia seguindo ritmos circadianos individuais.',
    category: 'attention',
    source: 'Dr. Russell Foster, University of Oxford',
    practical_application: 'Identifique seus horários de pico de concentração e programe tarefas complexas nestes períodos.'
  },
  {
    id: 'neuro_008',
    title: 'Exercise-Induced Neurogenesis',
    content: 'Exercício aeróbico estimula neurogênese no hipocampo, melhorando memória e aprendizado.',
    category: 'learning',
    source: 'Dr. Henriette van Praag, National Institute on Aging',
    practical_application: 'Inclua exercícios aeróbicos regulares na rotina para otimizar capacidade de aprendizado.'
  },

  {
    id: 'neuro_009',
    title: 'Arquitetura do Sono e Consolidação de Memória',
    content: 'Fases do sono (NREM e REM) desempenham papéis complementares na consolidação de memórias declarativas e procedurais.',
    category: 'sleep',
    source: 'Revisões em pesquisa do sono',
    practical_application: 'Priorize sono consistente e evite estudar intensamente imediatamente antes de dormir sem revisão leve.'
  },
  {
    id: 'neuro_010',
    title: 'Synaptic Homeostasis (Downscaling) durante o Sono',
    content: 'O sono promove downscaling sináptico, removendo ruído e fortalecendo conexões relevantes formadas durante o dia.',
    category: 'memory',
    source: 'Teorias contemporâneas em neurociência do sono',
    practical_application: 'Combine sessões intensas de aprendizado com descanso e sono para melhor retenção a longo prazo.'
  },

  {
    id: 'neuro_011',
    title: 'Chunking e Limite da Memória de Trabalho',
    content: 'A memória de trabalho tem capacidade limitada; agrupar informações (chunking) reduz carga cognitiva.',
    category: 'memory',
    source: 'Pesquisa cognitiva sobre memória de trabalho',
    practical_application: 'Organize conteúdo em blocos significativos (ex.: padrões, fórmulas, analogias) para facilitar memorização.'
  },
  {
    id: 'neuro_012',
    title: 'Sensory Gating e Filtragem de Distratores',
    content: 'O cérebro filtra estímulos irrelevantes via mecanismos de gating sensorial para preservar atenção sustentada.',
    category: 'attention',
    source: 'Estudos de neurofisiologia sensorial',
    practical_application: 'Reduza estímulos sensoriais (sons, notificações) e use sinalização visual/ambiental para manter foco.'
  },

  {
    id: 'neuro_013',
    title: 'Dificuldades Desejáveis (Desirable Difficulties)',
    content: 'Tornar a aprendizagem ligeiramente mais difícil no curto prazo (ex.: testes, recuperação ativa) melhora retenção a longo prazo.',
    category: 'learning',
    source: 'Pesquisas em psicologia cognitiva',
    practical_application: 'Prefira exercícios de recuperação ativa e variações nas práticas em vez de releitura passiva.'
  },
  {
    id: 'neuro_014',
    title: 'State-Dependent Learning',
    content: 'O estado fisiológico e contextual durante o estudo pode influenciar a recuperação da memória posteriormente.',
    category: 'memory',
    source: 'Estudos sobre recuperação de contexto',
    practical_application: 'Tente reproduzir condições (ambiente, níveis de alerta) semelhantes às esperadas durante a avaliação.'
  },

  {
    id: 'neuro_015',
    title: 'Prediction Error e Aprendizado por Reforço',
    content: 'Aprendizado é facilitado por discrepâncias entre expectativa e resultado (prediction error), que modulam dopamina.',
    category: 'motivation',
    source: 'Modelos de aprendizado por reforço em neurociência',
    practical_application: 'Forneça feedback imediato e ajuste a dificuldade para gerar sinais de aprendizado claros.'
  },

  {
    id: 'neuro_016',
    title: 'Regulação Emocional e Prefrontal Cortex',
    content: 'A regulação do stress envolve interações entre amígdala e córtex pré-frontal; fadiga do PFC reduz controle executivo.',
    category: 'stress',
    source: 'Pesquisas em neurobiologia do stress',
    practical_application: 'Inclua estratégias rápidas de regulação (respiração diafragmática, micro-pausas) antes de tarefas exigentes.'
  }
]


export interface MotivationalQuote {
  id: string
  content: string
  author: string
  length: number
  tags: string[]
  source: 'quotable' | 'local'
}
// Citações locais motivacionais para complementar a API
export const LOCAL_MOTIVATIONAL_QUOTES: Omit<MotivationalQuote, 'id'>[] = [
  {
    content: 'The expert in anything was once a beginner who never gave up.',
    author: 'Unknown',
    length: 60,
    tags: ['perseverance', 'learning', 'growth'],
    source: 'local'
  },
  {
    content: 'Code is poetry written in logic.',
    author: 'Unknown',
    length: 32,
    tags: ['programming', 'creativity', 'logic'],
    source: 'local'
  },
  {
    content: 'The best error message is the one that never shows up.',
    author: 'Thomas Fuchs',
    length: 54,
    tags: ['programming', 'design', 'user-experience'],
    source: 'local'
  },
  {
    content: 'Learning never exhausts the mind.',
    author: 'Leonardo da Vinci',
    length: 33,
    tags: ['learning', 'curiosity', 'knowledge'],
    source: 'local'
  },
  {
    content: 'The only way to learn a new programming language is by writing programs in it.',
    author: 'Dennis Ritchie',
    length: 77,
    tags: ['programming', 'practice', 'learning'],
    source: 'local'
  }
]