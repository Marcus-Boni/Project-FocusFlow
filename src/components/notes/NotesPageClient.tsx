"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { NotesService } from "@/services/notes-service";
import { StudyNote, NoteCategory, NOTE_TEMPLATES } from "@/types/notes";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Brain, 
  Clock, 
  BarChart3,
  PenTool,
  Map,
  Zap,
  Target,
  Edit3,
  Trash2,
  Tag
} from "lucide-react";

interface NotesPageProps {
  studyAreaId?: string;
}

export default function NotesPageClient({ studyAreaId }: NotesPageProps) {
  const { user } = useUserStore();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNoteType, setSelectedNoteType] = useState<string>("all");
  const [needsReview, setNeedsReview] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<StudyNote[]>([]);

  // Get current study area from URL params if not provided
  const currentStudyAreaId = studyAreaId || searchParams.get('area') || '';

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load categories and notes in parallel
      const [categoriesData, notesData] = await Promise.all([
        NotesService.getCategories(user.id),
        NotesService.getNotes(user.id, {
          studyAreaId: currentStudyAreaId || undefined,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          noteType: selectedNoteType !== 'all' ? selectedNoteType as "cornell" | "concept_map" | "outline" | "flashcard" | "free_form" : undefined,
          needsReview: needsReview
        })
      ]);

      setCategories(categoriesData);
      setNotes(notesData);

      // Load notes for review
      const reviewData = await NotesService.getNotesForReview(user.id, 10);
      setReviewNotes(reviewData);

    } catch (error) {
      console.error('Error loading notes data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentStudyAreaId, selectedCategory, selectedNoteType, needsReview]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = useCallback(async () => {
    if (!user || !searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      const searchResults = await NotesService.searchNotes(user.id, searchTerm, {
        studyAreaId: currentStudyAreaId || undefined,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      setNotes(searchResults);
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  }, [user, searchTerm, currentStudyAreaId, selectedCategory, loadData]);

  const handleCreateNote = () => {
    // Navigate to note editor
    console.log('Create note');
  };

  const handleEditNote = (note: StudyNote) => {
    console.log('Edit note:', note.id);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await NotesService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleStartReview = () => {
    console.log('Start review session');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Notes</h1>
          <p className="text-muted-foreground">
            Create, organize, and review your study notes using neuroscience-based techniques
          </p>
        </div>
        
        <div className="flex space-x-2">
          {reviewNotes.length > 0 && (
            <button
              onClick={handleStartReview}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Review ({reviewNotes.length})</span>
            </button>
          )}
          
          <button
            onClick={() => console.log('Show analytics')}
            className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={handleCreateNote}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Neuroscience Principles Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-lg border">
        <div className="flex items-start space-x-3">
          <Brain className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Evidence-Based Note-Taking</h3>
            <p className="text-sm text-muted-foreground mb-3">
              This system implements neuroscience research to optimize learning and retention
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Active Recall</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm">Spaced Repetition</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Elaborative Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search notes by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedNoteType}
            onChange={(e) => setSelectedNoteType(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="cornell">Cornell Notes</option>
            <option value="concept_map">Concept Maps</option>
            <option value="outline">Outlines</option>
            <option value="flashcard">Flashcards</option>
            <option value="free_form">Free Form</option>
          </select>

          <button
            onClick={() => setNeedsReview(!needsReview)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-md transition-colors ${
              needsReview 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'hover:bg-secondary'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Due for Review</span>
          </button>
        </div>
      </div>

      {/* Note Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h3 className="col-span-full text-lg font-semibold mb-2">Quick Start Templates</h3>
        {NOTE_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={handleCreateNote}
            className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3 mb-2">
              {template.type === 'cornell' && <PenTool className="w-5 h-5 text-blue-600" />}
              {template.type === 'concept_map' && <Map className="w-5 h-5 text-green-600" />}
              {template.type === 'flashcard' && <Zap className="w-5 h-5 text-purple-600" />}
              <h4 className="font-medium">{template.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Brain className="w-3 h-3" />
              <span>{template.neuroscience_benefits[0]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Notes Display */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start creating notes using evidence-based techniques to enhance your learning
          </p>
          <button
            onClick={handleCreateNote}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <Tag className="w-3 h-3" />
                    <span className="capitalize">{note.note_type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {note.summary || 'No summary available'}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Updated {new Date(note.updated_at).toLocaleDateString()}
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                  {note.note_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
