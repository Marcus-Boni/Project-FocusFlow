"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import {
  useSpacedRepetition,
  useActiveRecall,
} from "@/lib/hooks/useSpacedRepetition";
import { supabase, StudyArea } from "@/lib/supabase";
import {
  Brain,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Star,
  BookOpen,
  Target,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { toastUtils } from "@/lib/hooks/useToast";

export default function SpacedRepetitionPage() {
  const { user } = useUserStore();
  const { notes, dueNotes, createNote, reviewNote, refreshNotes } =
    useSpacedRepetition();

  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([]);
  const [activeTab, setActiveTab] = useState<"review" | "all" | "create">(
    "review"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingNote, setReviewingNote] = useState<(typeof notes)[0] | null>(
    null
  );

  // Form state for creating/editing notes
  const [editingNote, setEditingNote] = useState<(typeof notes)[0] | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    study_area_id: "",
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
  });

  const { isRevealed, timeSpent, startRecall, revealAnswer, reset } =
    useActiveRecall();

  useEffect(() => {
    const fetchStudyAreas = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("study_areas")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (error) throw error;
        setStudyAreas(data || []);
      } catch (error) {
        console.error("Error fetching study areas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyAreas();
    refreshNotes();
  }, [user, refreshNotes]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.study_area_id
    ) {
      return;
    }

    try {
      await createNote({
        title: formData.title,
        content: formData.content,
        study_area_id: formData.study_area_id,
        difficulty: formData.difficulty,
      });

      setFormData({
        title: "",
        content: "",
        study_area_id: "",
        difficulty: 3,
      });
      setActiveTab("all");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleStartReview = (note: (typeof notes)[0]) => {
    setReviewingNote(note);
    startRecall();
  };

  const handleReviewNote = async (difficulty: 1 | 2 | 3 | 4 | 5) => {
    if (!reviewingNote) return;

    try {
      await reviewNote(reviewingNote.id, difficulty, timeSpent);
      setReviewingNote(null);
      reset();
      toastUtils.spacedRepetition.reviewCompleted();
    } catch (error) {
      console.error("Error reviewing note:", error);
      toastUtils.data.error();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm("Tem certeza que deseja deletar esta nota?")) {
      try {
        const { error } = await supabase
          .from("study_notes")
          .delete()
          .eq("id", noteId);

        if (!error) {
          refreshNotes();
          toastUtils.data.deleted();
        } else {
          toastUtils.data.error();
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        toastUtils.data.error();
      }
    }
  };

  const getNextReviewText = (date: string) => {
    const reviewDate = new Date(date);

    if (isPast(reviewDate) && !isToday(reviewDate)) {
      return "Overdue";
    } else if (isToday(reviewDate)) {
      return "Due today";
    } else if (isTomorrow(reviewDate)) {
      return "Due tomorrow";
    } else {
      return `Due ${format(reviewDate, "MMM dd")}`;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "text-green-600";
      case 2:
        return "text-green-500";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-orange-500";
      case 5:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Very Easy";
      case 2:
        return "Easy";
      case 3:
        return "Normal";
      case 4:
        return "Hard";
      case 5:
        return "Very Hard";
      default:
        return "Normal";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Review Modal
  if (reviewingNote) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-card rounded-lg border p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{reviewingNote.title}</h1>
            <p className="text-muted-foreground">
              Think about the answer, then reveal it
            </p>
          </div>

          <div className="space-y-6">
            <div className="prose prose-sm max-w-none">
              {reviewingNote.content.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            {!isRevealed ? (
              <div className="text-center">
                <button
                  onClick={revealAnswer}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Show Answer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-t pt-6">
                  <p className="text-center font-medium mb-4">
                    How difficult was this to remember?
                  </p>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() =>
                          handleReviewNote(difficulty as 1 | 2 | 3 | 4 | 5)
                        }
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          difficulty <= 2
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : difficulty === 3
                            ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                            : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        }`}
                      >
                        {getDifficultyText(difficulty)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setReviewingNote(null);
                reset();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="w-6 h-6 text-primary" />
            <span>Spaced Repetition</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Master your knowledge with scientifically-proven spaced repetition
          </p>
        </div>

        <button
          onClick={() => setActiveTab("create")}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Notes
              </p>
              <p className="text-2xl font-bold">{notes.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Due Today
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {dueNotes.length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mastered
              </p>
              <p className="text-2xl font-bold text-green-600">
                {notes.filter((note) => note.repetition_count >= 5).length}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Difficulty
              </p>
              <p className="text-2xl font-bold">
                {notes.length > 0
                  ? (
                      notes.reduce((sum, note) => sum + note.difficulty, 0) /
                      notes.length
                    ).toFixed(1)
                  : "0"}
              </p>
            </div>
            <Star className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {(["review", "all", "create"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "review"
              ? `Review (${dueNotes.length})`
              : tab === "all"
              ? `All Notes (${notes.length})`
              : "Create New"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "review" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Notes Due for Review</h2>
          {dueNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">All caught up! 🎉</h3>
              <p>No notes are due for review right now.</p>
              <p className="mt-2">
                Come back later or create new notes to study.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueNotes.map((note) => (
                <div key={note.id} className="bg-card rounded-lg border p-4">
                  <h3 className="font-semibold mb-2">{note.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {note.content}
                  </p>
                  <div className="text-xs text-muted-foreground mb-3">
                    <p>Reviewed: {note.repetition_count} times</p>
                    <p>
                      Difficulty:{" "}
                      <span className={getDifficultyColor(note.difficulty)}>
                        {getDifficultyText(note.difficulty)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartReview(note)}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Start Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Study Notes</h2>
          {notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notes yet</h3>
              <p>
                Create your first study note to start learning with spaced
                repetition.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-card rounded-lg border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold truncate">{note.title}</h3>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setFormData({
                            title: note.title,
                            content: note.content,
                            study_area_id: note.study_area_id,
                            difficulty: note.difficulty,
                          });
                          setActiveTab("create");
                        }}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {note.content}
                  </p>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Reviewed: {note.repetition_count} times</p>
                    <p>
                      Difficulty:{" "}
                      <span className={getDifficultyColor(note.difficulty)}>
                        {getDifficultyText(note.difficulty)}
                      </span>
                    </p>
                    <p>{getNextReviewText(note.next_review_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "create" && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">
            {editingNote ? "Edit Note" : "Create New Study Note"}
          </h2>

          <form
            onSubmit={handleCreateNote}
            className="bg-card rounded-lg border p-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Enter note title..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Study Area
              </label>
              <div className="relative">
                <select
                  value={formData.study_area_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      study_area_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 pr-10 border rounded-md bg-background text-foreground appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent"
                  aria-label="Study Area"
                  required
                >
                  <option value="" className="text-muted-foreground">
                    Select a study area
                  </option>
                  {studyAreas.map((area) => (
                    <option
                      key={area.id}
                      value={area.id}
                      className="text-muted-foreground"
                    >
                      {area.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-muted-foreground"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background min-h-32"
                placeholder="Enter your study note content..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Initial Difficulty
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
                      }))
                    }
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      formData.difficulty === difficulty
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {getDifficultyText(difficulty)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setEditingNote(null);
                  setFormData({
                    title: "",
                    content: "",
                    study_area_id: "",
                    difficulty: 3,
                  });
                  setActiveTab("all");
                }}
                className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {editingNote ? "Update Note" : "Create Note"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
