-- =================================================================
-- SCHEMA SQL PARA SISTEMA DE METAS (GOALS) - FOCUSFLOW
-- Baseado em neurociência e metodologias SMART
-- =================================================================

-- Enum types para Goals
CREATE TYPE goal_timeframe AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE goal_category AS ENUM ('learning', 'skill', 'project', 'habit', 'career');
CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused', 'cancelled');

-- =================================================================
-- TABELA PRINCIPAL: GOALS
-- =================================================================

CREATE TABLE goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações básicas
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category goal_category NOT NULL,
    priority goal_priority NOT NULL DEFAULT 'medium',
    timeframe goal_timeframe NOT NULL,
    status goal_status NOT NULL DEFAULT 'not_started',
    
    -- Critérios SMART
    specific_details TEXT NOT NULL,
    measurable_metrics TEXT NOT NULL,
    target_value DECIMAL(10,2) NOT NULL DEFAULT 1,
    current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    target_date DATE NOT NULL,
    
    -- Motivação e neurociência
    motivation_reason TEXT NOT NULL,
    identity_connection TEXT NOT NULL,
    reward_description TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Índices para performance
    CONSTRAINT goals_user_id_idx FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT goals_target_value_positive CHECK (target_value > 0),
    CONSTRAINT goals_current_value_non_negative CHECK (current_value >= 0)
);

-- =================================================================
-- TABELA: GOAL_MILESTONES
-- Subdivisão de metas em marcos menores
-- =================================================================

CREATE TABLE goal_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    
    -- Informações do marco
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2) NOT NULL DEFAULT 1,
    current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    target_date DATE,
    
    -- Status e ordem
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT milestone_target_value_positive CHECK (target_value > 0),
    CONSTRAINT milestone_current_value_non_negative CHECK (current_value >= 0)
);

-- =================================================================
-- TABELA: GOAL_PROGRESS_LOGS
-- Log de progresso para tracking e análise
-- =================================================================

CREATE TABLE goal_progress_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES goal_milestones(id) ON DELETE SET NULL,
    
    -- Dados do progresso
    previous_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    new_value DECIMAL(10,2) NOT NULL,
    progress_delta DECIMAL(10,2) GENERATED ALWAYS AS (new_value - previous_value) STORED,
    
    -- Contexto
    notes TEXT,
    session_duration_minutes INTEGER,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Constraints
    CONSTRAINT progress_new_value_non_negative CHECK (new_value >= 0)
);

-- =================================================================
-- TABELA: GOAL_REWARDS
-- Sistema de recompensas para gamificação
-- =================================================================

CREATE TABLE goal_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    
    -- Informações da recompensa
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward_type VARCHAR(50) NOT NULL, -- 'milestone', 'completion', 'streak', etc.
    trigger_condition JSONB NOT NULL, -- Condições para ativar a recompensa
    
    -- Status
    is_earned BOOLEAN DEFAULT FALSE,
    earned_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =================================================================
-- ÍNDICES PARA PERFORMANCE
-- =================================================================

-- Índices principais
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_goals_timeframe ON goals(timeframe);

-- Índices compostos
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_goals_user_category ON goals(user_id, category);

-- Índices para milestones
CREATE INDEX idx_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_milestones_order ON goal_milestones(goal_id, order_index);

-- Índices para progress logs
CREATE INDEX idx_progress_goal_id ON goal_progress_logs(goal_id);
CREATE INDEX idx_progress_created_at ON goal_progress_logs(created_at DESC);

-- =================================================================
-- TRIGGERS PARA AUTO-UPDATE DE TIMESTAMPS
-- =================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas relevantes
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON goal_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- TRIGGER PARA AUTO-COMPLETION
-- =================================================================

-- Trigger para marcar meta como completa quando current_value >= target_value
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Se current_value alcançou ou superou target_value
    IF NEW.current_value >= NEW.target_value AND OLD.current_value < OLD.target_value THEN
        NEW.status = 'completed';
        NEW.completed_at = TIMEZONE('utc'::text, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_complete_goals BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION check_goal_completion();

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Habilitar RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas para GOALS
CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para GOAL_MILESTONES
CREATE POLICY "Users can view milestones of their goals" ON goal_milestones
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert milestones for their goals" ON goal_milestones
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can update milestones of their goals" ON goal_milestones
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete milestones of their goals" ON goal_milestones
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()
    ));

-- Políticas para GOAL_PROGRESS_LOGS
CREATE POLICY "Users can view progress of their goals" ON goal_progress_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_progress_logs.goal_id AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert progress for their goals" ON goal_progress_logs
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_progress_logs.goal_id AND goals.user_id = auth.uid()
    ));

-- Políticas para GOAL_REWARDS
CREATE POLICY "Users can view rewards of their goals" ON goal_rewards
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_rewards.goal_id AND goals.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage rewards of their goals" ON goal_rewards
    FOR ALL USING (EXISTS (
        SELECT 1 FROM goals WHERE goals.id = goal_rewards.goal_id AND goals.user_id = auth.uid()
    ));

-- =================================================================
-- VIEWS ÚTEIS PARA CONSULTAS
-- =================================================================

-- View para estatísticas de metas por usuário
CREATE VIEW user_goal_stats AS
SELECT 
    user_id,
    COUNT(*) as total_goals,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_goals,
    COUNT(*) FILTER (WHERE status = 'in_progress') as active_goals,
    COUNT(*) FILTER (WHERE status = 'not_started') as pending_goals,
    ROUND(
        AVG(CASE 
            WHEN status = 'completed' THEN 100 
            ELSE (current_value / NULLIF(target_value, 0)) * 100 
        END), 2
    ) as average_progress_percentage
FROM goals
GROUP BY user_id;

-- View para metas com progresso calculado
CREATE VIEW goals_with_progress AS
SELECT 
    g.*,
    CASE 
        WHEN g.status = 'completed' THEN 100
        ELSE ROUND((g.current_value / NULLIF(g.target_value, 0)) * 100, 2)
    END as progress_percentage,
    (SELECT COUNT(*) FROM goal_milestones gm WHERE gm.goal_id = g.id) as total_milestones,
    (SELECT COUNT(*) FROM goal_milestones gm WHERE gm.goal_id = g.id AND gm.is_completed = true) as completed_milestones
FROM goals g;

-- =================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =================================================================

COMMENT ON TABLE goals IS 'Tabela principal para metas baseadas em neurociência e metodologia SMART';
COMMENT ON TABLE goal_milestones IS 'Marcos e subdivisões de metas para facilitar o progresso';
COMMENT ON TABLE goal_progress_logs IS 'Log histórico de progresso para análise e insights';
COMMENT ON TABLE goal_rewards IS 'Sistema de recompensas para gamificação e motivação';

COMMENT ON COLUMN goals.identity_connection IS 'Conexão da meta com a identidade pessoal (neurociência)';
COMMENT ON COLUMN goals.motivation_reason IS 'Razão profunda de motivação para alcançar a meta';
COMMENT ON COLUMN goals.specific_details IS 'Detalhes específicos da meta (critério SMART)';
COMMENT ON COLUMN goals.measurable_metrics IS 'Métricas mensuráveis de progresso (critério SMART)';
