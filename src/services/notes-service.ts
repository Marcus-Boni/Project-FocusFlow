import { supabase } from '@/lib/supabase';
import { StudyNote, NoteCategory, NoteBlock, ReviewAnalytics, StudyNoteWithRelations } from '@/types/notes';

// Development mode flag - set to false when backend is ready
export class NotesService {
  // Category management
  static async getCategories(userId: string): Promise<NoteCategory[]> {
    const { data, error } = await supabase
      .from('note_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createCategory(category: Omit<NoteCategory, 'id' | 'created_at'>): Promise<NoteCategory> {
    const { data, error } = await supabase
      .from('note_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCategory(id: string, updates: Partial<NoteCategory>): Promise<NoteCategory> {
    const { data, error } = await supabase
      .from('note_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('note_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Notes management
  static async getNotes(
    userId: string,
    filters?: {
      studyAreaId?: string;
      categoryId?: string;
      tags?: string[];
      noteType?: StudyNote['note_type'];
      needsReview?: boolean;
    }
  ): Promise<StudyNote[]> {
    let query = supabase
      .from('study_notes')
      .select('*')
      .eq('user_id', userId);

    if (filters?.studyAreaId) {
      query = query.eq('study_area_id', filters.studyAreaId);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.noteType) {
      query = query.eq('note_type', filters.noteType);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.needsReview) {
      query = query.lte('next_review_date', new Date().toISOString());
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getNoteWithRelations(noteId: string): Promise<StudyNoteWithRelations | null> {
    // Get the main note
    const { data: note, error: noteError } = await supabase
      .from('study_notes')
      .select(`
        *,
        category:note_categories(*)
      `)
      .eq('id', noteId)
      .single();

    if (noteError) throw noteError;
    if (!note) return null;

    // Get note blocks
    const { data: blocks, error: blocksError } = await supabase
      .from('note_blocks')
      .select('*')
      .eq('note_id', noteId)
      .order('position');

    if (blocksError) throw blocksError;

    // Get relationships
    const { data: relationships, error: relError } = await supabase
      .from('note_relationships')
      .select('*')
      .or(`source_note_id.eq.${noteId},target_note_id.eq.${noteId}`);

    if (relError) throw relError;

    // Get recent analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('review_analytics')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (analyticsError) throw analyticsError;

    return {
      ...note,
      blocks: blocks || [],
      relationships: {
        related_notes: relationships?.filter(r => r.relationship_type === 'related') || [],
        prerequisite_notes: relationships?.filter(r => r.relationship_type === 'prerequisite') || [],
        elaboration_notes: relationships?.filter(r => r.relationship_type === 'elaboration') || []
      },
      analytics: analytics || []
    };
  }

  static async createNote(
    note: Omit<StudyNote, 'id' | 'created_at' | 'updated_at' | 'repetition_count' | 'word_count' | 'reading_time'>,
    blocks?: Omit<NoteBlock, 'id' | 'note_id' | 'created_at' | 'updated_at'>[]
  ): Promise<StudyNote> {
    // Create the note
    const { data: newNote, error: noteError } = await supabase
      .from('study_notes')
      .insert({
        ...note,
        next_review_date: this.calculateNextReviewDate(0, note.difficulty || 3, 3)
      })
      .select()
      .single();

    if (noteError) throw noteError;

    // Create blocks if provided
    if (blocks && blocks.length > 0) {
      const noteBlocks = blocks.map(block => ({
        ...block,
        note_id: newNote.id
      }));

      const { error: blocksError } = await supabase
        .from('note_blocks')
        .insert(noteBlocks);

      if (blocksError) throw blocksError;
    }

    return newNote;
  }

  static async updateNote(
    id: string,
    updates: Partial<StudyNote>,
    blocks?: NoteBlock[]
  ): Promise<StudyNote> {
    // Update the note
    const { data: updatedNote, error: noteError } = await supabase
      .from('study_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (noteError) throw noteError;

    // Update blocks if provided
    if (blocks) {
      // Delete existing blocks
      await supabase
        .from('note_blocks')
        .delete()
        .eq('note_id', id);

      // Insert new blocks
      if (blocks.length > 0) {
        const { error: blocksError } = await supabase
          .from('note_blocks')
          .insert(blocks.map(block => ({ ...block, note_id: id })));

        if (blocksError) throw blocksError;
      }
    }

    return updatedNote;
  }

  static async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('study_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Review and spaced repetition
  static async getNotesForReview(userId: string, limit = 20): Promise<StudyNote[]> {
    const { data, error } = await supabase
      .from('study_notes')
      .select('*')
      .eq('user_id', userId)
      .lte('next_review_date', new Date().toISOString())
      .order('next_review_date')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async recordReview(
    noteId: string,
    userId: string,
    performance: {
      initialConfidence: number;
      finalConfidence: number;
      timeSpent: number;
      wasRecalled: boolean;
      retrievalAttempts: number;
    }
  ): Promise<void> {
    // Get current note data
    const { data: note, error: noteError } = await supabase
      .from('study_notes')
      .select('repetition_count, difficulty, confidence_level')
      .eq('id', noteId)
      .single();

    if (noteError) throw noteError;

    // Calculate new values based on performance
    const newRepetitionCount = (note.repetition_count || 0) + 1;
    const difficultyAdjustment = this.calculateDifficultyAdjustment(
      performance.finalConfidence,
      performance.wasRecalled
    );
    const newDifficulty = Math.max(1, Math.min(5, note.difficulty + difficultyAdjustment));
    const nextReviewDate = this.calculateNextReviewDate(
      newRepetitionCount,
      newDifficulty,
      performance.finalConfidence
    );

    // Update note
    const { error: updateError } = await supabase
      .from('study_notes')
      .update({
        repetition_count: newRepetitionCount,
        difficulty: newDifficulty,
        confidence_level: performance.finalConfidence,
        next_review_date: nextReviewDate,
        last_reviewed_at: new Date().toISOString()
      })
      .eq('id', noteId);

    if (updateError) throw updateError;

    // Record analytics
    const { error: analyticsError } = await supabase
      .from('review_analytics')
      .insert({
        user_id: userId,
        note_id: noteId,
        review_date: new Date().toISOString().split('T')[0],
        initial_confidence: performance.initialConfidence,
        final_confidence: performance.finalConfidence,
        time_spent: performance.timeSpent,
        retrieval_attempts: performance.retrievalAttempts,
        was_recalled: performance.wasRecalled,
        difficulty_adjustments: difficultyAdjustment
      });

    if (analyticsError) throw analyticsError;
  }

  // Search and filtering
  static async searchNotes(
    userId: string,
    searchTerm: string,
    filters?: {
      studyAreaId?: string;
      categoryId?: string;
      tags?: string[];
    }
  ): Promise<StudyNote[]> {
    let query = supabase
      .from('study_notes')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`);

    if (filters?.studyAreaId) {
      query = query.eq('study_area_id', filters.studyAreaId);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Analytics
  static async getReviewAnalytics(userId: string, dateRange?: { start: string; end: string }): Promise<ReviewAnalytics[]> {
    let query = supabase
      .from('review_analytics')
      .select('*')
      .eq('user_id', userId);

    if (dateRange) {
      query = query
        .gte('review_date', dateRange.start)
        .lte('review_date', dateRange.end);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Utility functions
  private static calculateNextReviewDate(
    repetitionCount: number,
    difficulty: number,
    confidence: number
  ): string {
    // Enhanced SM-2 algorithm
    let interval: number;
    
    if (repetitionCount === 0) {
      interval = 1;
    } else if (repetitionCount === 1) {
      interval = 6;
    } else {
      const easinessFactor = 2.5 + (0.1 * (confidence - 3)) - (0.08 * (difficulty - 1));
      const clampedEasiness = Math.max(1.3, easinessFactor);
      interval = Math.ceil(Math.pow(clampedEasiness, repetitionCount - 1) * 6);
    }

    // Cap at 365 days
    interval = Math.min(interval, 365);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate.toISOString();
  }

  private static calculateDifficultyAdjustment(confidence: number, wasRecalled: boolean): number {
    if (!wasRecalled) return 1; // Increase difficulty if not recalled
    if (confidence <= 2) return 0; // No change for low confidence
    if (confidence >= 4) return -1; // Decrease difficulty for high confidence
    return 0; // No change for medium confidence
  }
}
