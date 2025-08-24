// Enhanced types for the neuroscience-based notes system

export interface NoteCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface StudyNote {
  id: string;
  user_id: string;
  study_area_id: string;
  category_id?: string;
  title: string;
  content: string;
  summary?: string;
  note_type: 'cornell' | 'concept_map' | 'outline' | 'flashcard' | 'free_form';
  tags: string[];
  questions: string[];
  connections: string[];
  difficulty: number; // 1-5
  confidence_level: number; // 1-5
  repetition_count: number;
  review_frequency: number; // days between reviews
  next_review_date: string;
  last_reviewed_at?: string;
  is_favorite: boolean;
  word_count: number;
  reading_time: number; // estimated reading time in minutes
  created_at: string;
  updated_at: string;
}

export interface NoteBlock {
  id: string;
  note_id: string;
  block_type: 'main_content' | 'cue' | 'summary' | 'question' | 'answer' | 'concept' | 'connection';
  content: string;
  position: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NoteRelationship {
  id: string;
  source_note_id: string;
  target_note_id: string;
  relationship_type: 'related' | 'prerequisite' | 'elaboration' | 'contradiction' | 'example';
  strength: number; // 1-5
  description?: string;
  created_at: string;
}

export interface ReviewAnalytics {
  id: string;
  user_id: string;
  note_id: string;
  review_date: string;
  initial_confidence: number;
  final_confidence: number;
  time_spent: number; // in seconds
  retrieval_attempts: number;
  was_recalled: boolean;
  difficulty_adjustments: number;
  created_at: string;
}

export interface StudyGoal {
  id: string;
  user_id: string;
  study_area_id?: string;
  title: string;
  description?: string;
  target_type: 'notes_count' | 'review_streak' | 'study_time' | 'mastery_level';
  target_value: number;
  current_value: number;
  deadline?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Extended interfaces for UI components
export interface StudyNoteWithRelations extends StudyNote {
  category?: NoteCategory;
  blocks?: NoteBlock[];
  relationships?: {
    related_notes: NoteRelationship[];
    prerequisite_notes: NoteRelationship[];
    elaboration_notes: NoteRelationship[];
  };
  analytics?: ReviewAnalytics[];
}

export interface NoteTakingTemplate {
  id: string;
  name: string;
  description: string;
  type: StudyNote['note_type'];
  blocks: Omit<NoteBlock, 'id' | 'note_id' | 'created_at' | 'updated_at'>[];
  guidelines: string[];
  neuroscience_benefits: string[];
}

// Predefined templates based on neuroscience research
export const NOTE_TEMPLATES: NoteTakingTemplate[] = [
  {
    id: 'cornell',
    name: 'Cornell Notes',
    description: 'Systematic format for condensing and organizing notes',
    type: 'cornell',
    blocks: [
      {
        block_type: 'main_content',
        content: '',
        position: 0,
        metadata: { section: 'notes', width: '70%' }
      },
      {
        block_type: 'cue',
        content: '',
        position: 1,
        metadata: { section: 'cues', width: '30%' }
      },
      {
        block_type: 'summary',
        content: '',
        position: 2,
        metadata: { section: 'summary', width: '100%' }
      }
    ],
    guidelines: [
      'Use the largest section for detailed notes during lectures or reading',
      'Create questions and keywords in the cue column after class',
      'Summarize the main ideas at the bottom',
      'Review by covering notes and testing yourself with cues'
    ],
    neuroscience_benefits: [
      'Enhances active processing through multiple encoding formats',
      'Promotes retrieval practice through cue-based testing',
      'Supports memory consolidation through summarization',
      'Facilitates spaced repetition review sessions'
    ]
  },
  {
    id: 'concept_map',
    name: 'Concept Map',
    description: 'Visual representation of relationships between concepts',
    type: 'concept_map',
    blocks: [
      {
        block_type: 'concept',
        content: '',
        position: 0,
        metadata: { x: 0, y: 0, isMainConcept: true }
      }
    ],
    guidelines: [
      'Start with the main concept at the center or top',
      'Connect related concepts with labeled relationships',
      'Use hierarchical structure from general to specific',
      'Include cross-links between different concept branches'
    ],
    neuroscience_benefits: [
      'Activates visual-spatial processing pathways',
      'Strengthens conceptual understanding through relationship mapping',
      'Enhances memory through dual coding (visual + verbal)',
      'Promotes deep learning through connection identification'
    ]
  },
  {
    id: 'flashcard',
    name: 'Digital Flashcards',
    description: 'Question-answer pairs for active recall practice',
    type: 'flashcard',
    blocks: [
      {
        block_type: 'question',
        content: '',
        position: 0,
        metadata: { side: 'front' }
      },
      {
        block_type: 'answer',
        content: '',
        position: 1,
        metadata: { side: 'back' }
      }
    ],
    guidelines: [
      'Create clear, specific questions',
      'Keep answers concise but complete',
      'Include context when necessary',
      'Review regularly using spaced repetition'
    ],
    neuroscience_benefits: [
      'Maximizes retrieval practice effects',
      'Strengthens memory through active recall',
      'Enables efficient spaced repetition schedules',
      'Builds confidence through successful retrieval'
    ]
  }
];

// Neuroscience-based note-taking principles
export const NEUROSCIENCE_PRINCIPLES = {
  activeRecall: {
    title: 'Active Recall',
    description: 'Testing yourself retrieves information from memory, strengthening neural pathways',
    techniques: ['Self-questioning', 'Flashcards', 'Summarizing from memory', 'Teaching others']
  },
  spacedRepetition: {
    title: 'Spaced Repetition',
    description: 'Reviewing information at increasing intervals optimizes long-term retention',
    techniques: ['Scheduled reviews', 'Increasing intervals', 'Difficulty-based scheduling']
  },
  elaborativeProcessing: {
    title: 'Elaborative Processing',
    description: 'Connecting new information to existing knowledge creates stronger memory traces',
    techniques: ['Asking "why" and "how"', 'Creating analogies', 'Finding examples', 'Making connections']
  },
  dualCoding: {
    title: 'Dual Coding',
    description: 'Using both visual and verbal processing enhances memory encoding',
    techniques: ['Diagrams and text', 'Mind maps', 'Concept maps', 'Visual annotations']
  },
  cognitiveLoad: {
    title: 'Cognitive Load Management',
    description: 'Organizing information reduces mental effort and improves comprehension',
    techniques: ['Chunking information', 'Clear structure', 'Progressive disclosure', 'Eliminating distractions']
  }
};
