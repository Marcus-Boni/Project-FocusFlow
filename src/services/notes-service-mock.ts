import { StudyNote, NoteCategory } from '@/types/notes';
import { mockNotes, mockCategories } from '@/lib/mock-data';

interface NoteFilters {
  studyAreaId?: string;
  categoryId?: string;
  noteType?: string;
  needsReview?: boolean;
}

interface SearchFilters {
  studyAreaId?: string;
  categoryId?: string;
}

export class NotesService {
  // Categories
  static async getCategories(): Promise<NoteCategory[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
  }

  static async createCategory(data: {
    user_id: string;
    name: string;
    description?: string;
    color: string;
  }): Promise<NoteCategory> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCategory: NoteCategory = {
      id: `cat-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    return newCategory;
  }

  // Notes
  static async getNotes(userId: string, filters?: NoteFilters): Promise<StudyNote[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filteredNotes = [...mockNotes];

    if (filters?.studyAreaId) {
      filteredNotes = filteredNotes.filter(note => note.study_area_id === filters.studyAreaId);
    }

    if (filters?.noteType && filters.noteType !== 'all') {
      filteredNotes = filteredNotes.filter(note => note.note_type === filters.noteType);
    }

    if (filters?.needsReview) {
      const now = new Date();
      filteredNotes = filteredNotes.filter(note => 
        new Date(note.next_review_date) <= now
      );
    }

    return filteredNotes;
  }

  static async getNotesForReview(userId: string, limit: number = 10): Promise<StudyNote[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const now = new Date();
    const reviewNotes = mockNotes
      .filter(note => new Date(note.next_review_date) <= now)
      .sort((a, b) => new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime())
      .slice(0, limit);

    return reviewNotes;
  }

  static async createNote(data: {
    user_id: string;
    study_area_id: string;
    title: string;
    content: string;
    note_type: StudyNote['note_type'];
    summary?: string;
    tags?: string[];
    confidence_level?: number;
  }): Promise<StudyNote> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      ...data,
      tags: data.tags || [],
      confidence_level: data.confidence_level || 3,
      next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [],
      connections: [],
      difficulty: 0,
      repetition_count: 0,
      review_frequency: 0,
      is_favorite: false,
      word_count: 0,
      reading_time: 0
    };

    return newNote;
  }

  static async updateNote(noteId: string, data: Partial<StudyNote>): Promise<StudyNote> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const existingNote = mockNotes.find(note => note.id === noteId);
    if (!existingNote) {
      throw new Error('Note not found');
    }

    const updatedNote: StudyNote = {
      ...existingNote,
      ...data,
      updated_at: new Date().toISOString(),
    };

    return updatedNote;
  }

  static async deleteNote(noteId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real implementation, this would delete from the database
    console.log(`Note ${noteId} deleted`);
  }

  static async searchNotes(userId: string, query: string, filters?: SearchFilters): Promise<StudyNote[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filteredNotes = [...mockNotes];

    if (filters?.studyAreaId) {
      filteredNotes = filteredNotes.filter(note => note.study_area_id === filters.studyAreaId);
    }

    // Simple text search
    const searchTerms = query.toLowerCase().split(' ');
    filteredNotes = filteredNotes.filter(note => {
      const searchableText = `${note.title} ${note.content} ${note.summary || ''} ${note.tags?.join(' ') || ''}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });

    return filteredNotes;
  }

  // Review functionality
  static async recordReview(noteId: string, data: {
    user_id: string;
    initial_confidence: number;
    final_confidence: number;
    time_spent: number;
    was_recalled: boolean;
  }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Review recorded for note ${noteId}:`, data);
    
    // In a real implementation, this would calculate the next review date
    // using spaced repetition algorithm
  }
}
