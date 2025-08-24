-- Enhanced Notes System for Neuroscience-Based Learning
-- Run this in your Supabase SQL Editor to enhance the notes system

-- Create note_categories table for better organization
CREATE TABLE IF NOT EXISTS public.note_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enhance study_notes table with neuroscience-based features
ALTER TABLE public.study_notes 
ADD COLUMN IF NOT EXISTS note_type VARCHAR(20) DEFAULT 'cornell' CHECK (note_type IN ('cornell', 'concept_map', 'outline', 'flashcard', 'free_form')),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.note_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of tags for better search
ADD COLUMN IF NOT EXISTS summary TEXT, -- Key takeaways section
ADD COLUMN IF NOT EXISTS questions TEXT[], -- Self-generated questions
ADD COLUMN IF NOT EXISTS connections TEXT[], -- Connections to other notes/concepts
ADD COLUMN IF NOT EXISTS confidence_level INTEGER DEFAULT 3 CHECK (confidence_level >= 1 AND confidence_level <= 5),
ADD COLUMN IF NOT EXISTS review_frequency INTEGER DEFAULT 1, -- Days between reviews
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0; -- estimated reading time in minutes

-- Create note_blocks table for structured content (Cornell notes, concept maps)
CREATE TABLE IF NOT EXISTS public.note_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID REFERENCES public.study_notes(id) ON DELETE CASCADE NOT NULL,
    block_type VARCHAR(20) NOT NULL CHECK (block_type IN ('main_content', 'cue', 'summary', 'question', 'answer', 'concept', 'connection')),
    content TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- For storing additional properties like coordinates, styling, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create note_relationships table for linking notes
CREATE TABLE IF NOT EXISTS public.note_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_note_id UUID REFERENCES public.study_notes(id) ON DELETE CASCADE NOT NULL,
    target_note_id UUID REFERENCES public.study_notes(id) ON DELETE CASCADE NOT NULL,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('related', 'prerequisite', 'elaboration', 'contradiction', 'example')),
    strength INTEGER DEFAULT 3 CHECK (strength >= 1 AND strength <= 5), -- Strength of the relationship
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(source_note_id, target_note_id, relationship_type)
);

-- Create review_analytics table for spaced repetition analytics
CREATE TABLE IF NOT EXISTS public.review_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    note_id UUID REFERENCES public.study_notes(id) ON DELETE CASCADE NOT NULL,
    review_date DATE NOT NULL,
    initial_confidence INTEGER NOT NULL CHECK (initial_confidence >= 1 AND initial_confidence <= 5),
    final_confidence INTEGER NOT NULL CHECK (final_confidence >= 1 AND final_confidence <= 5),
    time_spent INTEGER NOT NULL, -- in seconds
    retrieval_attempts INTEGER DEFAULT 1,
    was_recalled BOOLEAN NOT NULL,
    difficulty_adjustments INTEGER DEFAULT 0, -- How much difficulty was adjusted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create study_goals table for goal tracking
CREATE TABLE IF NOT EXISTS public.study_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    study_area_id UUID REFERENCES public.study_areas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('notes_count', 'review_streak', 'study_time', 'mastery_level')),
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    deadline DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for new tables
ALTER TABLE public.note_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for note_categories
CREATE POLICY "Users can manage their own note categories" ON public.note_categories
    FOR ALL USING (auth.uid() = user_id);

-- RLS policies for note_blocks
CREATE POLICY "Users can manage their own note blocks" ON public.note_blocks
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.study_notes WHERE id = note_blocks.note_id));

-- RLS policies for note_relationships
CREATE POLICY "Users can manage their own note relationships" ON public.note_relationships
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM public.study_notes WHERE id = note_relationships.source_note_id)
        AND auth.uid() = (SELECT user_id FROM public.study_notes WHERE id = note_relationships.target_note_id)
    );

-- RLS policies for review_analytics
CREATE POLICY "Users can view their own review analytics" ON public.review_analytics
    FOR ALL USING (auth.uid() = user_id);

-- RLS policies for study_goals
CREATE POLICY "Users can manage their own study goals" ON public.study_goals
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_note_categories_user_id ON public.note_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_note_blocks_note_id ON public.note_blocks(note_id);
CREATE INDEX IF NOT EXISTS idx_note_blocks_type ON public.note_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_note_relationships_source ON public.note_relationships(source_note_id);
CREATE INDEX IF NOT EXISTS idx_note_relationships_target ON public.note_relationships(target_note_id);
CREATE INDEX IF NOT EXISTS idx_review_analytics_user_date ON public.review_analytics(user_id, review_date);
CREATE INDEX IF NOT EXISTS idx_study_notes_tags ON public.study_notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_study_notes_category ON public.study_notes(category_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_confidence ON public.study_notes(confidence_level);
CREATE INDEX IF NOT EXISTS idx_study_goals_user_area ON public.study_goals(user_id, study_area_id);

-- Create triggers for updated_at fields
CREATE TRIGGER update_note_blocks_updated_at BEFORE UPDATE ON public.note_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_goals_updated_at BEFORE UPDATE ON public.study_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate optimal review intervals based on spaced repetition algorithm
CREATE OR REPLACE FUNCTION calculate_next_review_date(
    current_difficulty INTEGER,
    review_count INTEGER,
    performance_rating INTEGER
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    base_interval INTEGER;
    easiness_factor DECIMAL;
    interval_days INTEGER;
BEGIN
    -- SM-2 Algorithm inspired calculation
    easiness_factor := 2.5 + (0.1 * (performance_rating - 3)) - (0.08 * (current_difficulty - 1));
    
    -- Ensure easiness factor doesn't go below 1.3
    IF easiness_factor < 1.3 THEN
        easiness_factor := 1.3;
    END IF;
    
    -- Calculate interval based on review count
    CASE review_count
        WHEN 0 THEN interval_days := 1;
        WHEN 1 THEN interval_days := 6;
        ELSE 
            interval_days := CEIL(POWER(easiness_factor, review_count - 1) * 6);
    END CASE;
    
    -- Cap maximum interval at 365 days
    IF interval_days > 365 THEN
        interval_days := 365;
    END IF;
    
    RETURN timezone('utc'::text, now()) + (interval_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to update note statistics
CREATE OR REPLACE FUNCTION update_note_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update word count and reading time for the note
    UPDATE public.study_notes
    SET 
        word_count = (
            LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1
        ),
        reading_time = CEIL(
            (LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1) / 200.0
        ), -- Assuming 200 words per minute reading speed
        updated_at = NOW()
    WHERE id = NEW.note_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update note statistics when content changes
CREATE TRIGGER update_note_stats_on_block_change
    AFTER INSERT OR UPDATE OR DELETE ON public.note_blocks
    FOR EACH ROW EXECUTE FUNCTION update_note_statistics();

-- Function to automatically create default categories for new users
CREATE OR REPLACE FUNCTION create_default_note_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default categories for the new user
    INSERT INTO public.note_categories (user_id, name, description, color) VALUES
        (NEW.id, 'Concepts', 'Main concepts and theories', '#3B82F6'),
        (NEW.id, 'Examples', 'Practical examples and applications', '#10B981'),
        (NEW.id, 'Formulas', 'Mathematical formulas and equations', '#F59E0B'),
        (NEW.id, 'Definitions', 'Key terms and definitions', '#8B5CF6'),
        (NEW.id, 'To Review', 'Notes that need additional review', '#EF4444');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default categories for new users
CREATE TRIGGER create_default_categories_for_new_user
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION create_default_note_categories();

-- Grant permissions for new tables
GRANT ALL ON public.note_categories TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.note_blocks TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.note_relationships TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.review_analytics TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.study_goals TO postgres, anon, authenticated, service_role;
