"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { supabase, StudyArea } from '@/lib/supabase'
import { Plus, BookOpen, Edit, Trash2 } from 'lucide-react'

const predefinedColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
]

export default function StudyAreasPage() {
  const { user } = useUserStore()
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingArea, setEditingArea] = useState<StudyArea | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: predefinedColors[0]
  })

  

  const fetchStudyAreas = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('study_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching study areas:', error)
      } else {
        setStudyAreas(data || [])
      }
    } catch (error) {
      console.error('Error fetching study areas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStudyAreas()
  }, [fetchStudyAreas])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    try {
      if (editingArea) {
        // Update existing area
        const { error } = await supabase
          .from('study_areas')
          .update({
            name: formData.name,
            description: formData.description,
            color: formData.color,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArea.id)

        if (!error) {
          setStudyAreas(areas => 
            areas.map(area => 
              area.id === editingArea.id 
                ? { ...area, ...formData, updated_at: new Date().toISOString() }
                : area
            )
          )
        }
      } else {
        // Create new area
        const { data, error } = await supabase
          .from('study_areas')
          .insert([{
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            color: formData.color
          }])
          .select()

        if (!error && data) {
          setStudyAreas(areas => [data[0], ...areas])
        }
      }

      // Reset form
      setFormData({ name: '', description: '', color: predefinedColors[0] })
      setShowForm(false)
      setEditingArea(null)
    } catch (error) {
      console.error('Error saving study area:', error)
    }
  }

  const handleEdit = (area: StudyArea) => {
    setEditingArea(area)
    setFormData({
      name: area.name,
      description: area.description || '',
      color: area.color
    })
    setShowForm(true)
  }

  const handleDelete = async (areaId: string) => {
    if (!confirm('Are you sure you want to delete this study area?')) return

    try {
      const { error } = await supabase
        .from('study_areas')
        .delete()
        .eq('id', areaId)

      if (!error) {
        setStudyAreas(areas => areas.filter(area => area.id !== areaId))
      }
    } catch (error) {
      console.error('Error deleting study area:', error)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', color: predefinedColors[0] })
    setShowForm(false)
    setEditingArea(null)
  }

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
    )
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
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
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
              {editingArea ? 'Edit Study Area' : 'Add Study Area'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., JavaScript, React, Algorithms"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="What will you be studying in this area?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex space-x-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  {editingArea ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/80 transition-colors"
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
            Create your first study area to start organizing your learning journey.
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
              className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
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
                    className="p-1 hover:bg-accent rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="p-1 hover:bg-accent rounded text-destructive"
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
    </div>
  )
}
