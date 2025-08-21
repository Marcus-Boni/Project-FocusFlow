"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { supabase, StudyArea } from "@/lib/supabase";
import { Plus, BookOpen, Edit, Trash2, AlertTriangle } from "lucide-react";
import { toastUtils } from "@/lib/hooks/useToast";

const predefinedColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export default function StudyAreasPage() {
  const { user } = useUserStore();
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<StudyArea | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    area: StudyArea | null;
  }>({ isOpen: false, area: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: predefinedColors[0],
  });

  const fetchStudyAreas = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("study_areas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching study areas:", error);
      } else {
        setStudyAreas(data || []);
      }
    } catch (error) {
      console.error("Error fetching study areas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudyAreas();
  }, [fetchStudyAreas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    // Validações
    if (formData.name.trim().length < 2) {
      toastUtils.data.error();
      return;
    }

    // Verificar se já existe uma área com o mesmo nome (exceto a que está sendo editada)
    const existingArea = studyAreas.find(
      (area) => 
        area.name.toLowerCase() === formData.name.trim().toLowerCase() && 
        area.id !== editingArea?.id
    );
    
    if (existingArea) {
      toastUtils.data.error();
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingArea) {
        // Update existing area
        const { error } = await supabase
          .from("study_areas")
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            color: formData.color,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingArea.id);

        if (!error) {
          setStudyAreas((areas) =>
            areas.map((area) =>
              area.id === editingArea.id
                ? { 
                    ...area, 
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    color: formData.color,
                    updated_at: new Date().toISOString() 
                  }
                : area
            )
          );
          toastUtils.studyArea.updated(formData.name.trim());
        } else {
          console.error("Error updating study area:", error);
          toastUtils.studyArea.error();
        }
      } else {
        // Create new area
        const { data, error } = await supabase
          .from("study_areas")
          .insert([
            {
              user_id: user.id,
              name: formData.name.trim(),
              description: formData.description.trim() || undefined,
              color: formData.color,
            },
          ])
          .select();

        if (!error && data) {
          setStudyAreas((areas) => [data[0], ...areas]);
          toastUtils.studyArea.created(formData.name.trim());
        } else {
          console.error("Error creating study area:", error);
          toastUtils.studyArea.error();
        }
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error saving study area:", error);
      toastUtils.studyArea.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (area: StudyArea) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description || "",
      color: area.color,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (area: StudyArea) => {
    setDeleteConfirmation({ isOpen: true, area });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.area) return;

    try {
      const { error } = await supabase
        .from("study_areas")
        .delete()
        .eq("id", deleteConfirmation.area.id);

      if (!error) {
        setStudyAreas((areas) => 
          areas.filter((area) => area.id !== deleteConfirmation.area!.id)
        );
        toastUtils.studyArea.deleted(deleteConfirmation.area.name);
      } else {
        console.error("Error deleting study area:", error);
        toastUtils.studyArea.error();
      }
    } catch (error) {
      console.error("Error deleting study area:", error);
      toastUtils.studyArea.error();
    } finally {
      setDeleteConfirmation({ isOpen: false, area: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, area: null });
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: predefinedColors[0] });
    setShowForm(false);
    setEditingArea(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Areas</h1>
          <p className="text-muted-foreground">
            Organize your studies by subject or technology
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Area</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingArea ? "Edit Study Area" : "Add Study Area"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  placeholder="e.g., JavaScript, React, Algorithms"
                  required
                  disabled={isSubmitting}
                  minLength={2}
                  maxLength={50}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.name.length}/50 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  rows={3}
                  placeholder="What will you be studying in this area?"
                  disabled={isSubmitting}
                  maxLength={200}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/200 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 rounded-md border-2 transition-all hover:scale-105 ${
                        formData.color === color
                          ? "border-foreground shadow-md"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={isSubmitting}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Selected: {formData.color}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isSubmitting || formData.name.trim().length < 2}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                      {editingArea ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingArea ? "Update Area" : "Create Area"}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Study Areas Grid */}
      {studyAreas.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Study Areas Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first study area to start organizing your learning
            journey.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Your First Study Area
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyAreas.map((area) => (
            <div
              key={area.id}
              className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <h3 className="font-semibold text-lg">{area.name}</h3>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(area)}
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    title="Editar área"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(area)}
                    className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                    title="Excluir área"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {area.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {area.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span>0h 0m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Study:</span>
                  <span>Never</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.area && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Study Area</h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <p className="text-sm mb-6">
              Are you sure you want to delete the study area{" "}
              <span className="font-semibold">&ldquo;{deleteConfirmation.area.name}&rdquo;</span>?
              All associated study sessions will remain, but they will no longer be linked to this area.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-destructive text-destructive-foreground py-2 px-4 rounded-md hover:bg-destructive/90 transition-colors"
              >
                Delete Area
              </button>
              <button
                onClick={handleDeleteCancel}
                className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
