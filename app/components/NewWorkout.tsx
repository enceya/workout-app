'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Exercise = {
  id: string
  name: string
  category: string
  equipment: string | null
}

type WorkoutExercise = {
  exerciseId: string
  sets: { reps: number; weight: number; completed: boolean }[]
  notes: string
}

export default function NewWorkout({
  exercises,
  onClose,
  userId,
}: {
  exercises: Exercise[]
  onClose: () => void
  userId: string
}) {
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([])
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const addExercise = (exerciseId: string) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId,
        sets: [{ reps: 10, weight: 0, completed: true }],
        notes: '',
      },
    ])
  }

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const addSet = (exerciseIndex: number) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets.push({ reps: 10, weight: 0, completed: true })
    setSelectedExercises(updated)
  }

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    value: number
  ) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets[setIndex][field] = value
    setSelectedExercises(updated)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...selectedExercises]
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex)
    setSelectedExercises(updated)
  }

  const saveWorkout = async () => {
    if (!workoutName.trim() || selectedExercises.length === 0) {
      alert('Please enter a workout name and add at least one exercise')
      return
    }

    setSaving(true)

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name: workoutName,
          workout_date: workoutDate,
          duration_minutes: duration ? parseInt(duration) : null,
          notes: workoutNotes || null,
        } as any)
        .select()
        .single()

      if (workoutError) throw workoutError

      // Create workout exercises
      const workoutExercises = selectedExercises.map((exercise, index) => ({
        workout_id: (workout as any).id,
        exercise_id: exercise.exerciseId,
        order_index: index,
        sets: exercise.sets,
        notes: exercise.notes || null,
      }))

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises as any)

      if (exercisesError) throw exercisesError

      window.location.reload()
    } catch (error: any) {
      alert('Error saving workout: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">New Workout</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workout Name *
              </label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Upper Body Day"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="How did you feel? Any observations?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Exercise
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addExercise(e.target.value)
                  e.target.value = ''
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an exercise...</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.category})
                </option>
              ))}
            </select>
          </div>

          {selectedExercises.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Exercises</h3>
              {selectedExercises.map((workoutExercise, exerciseIndex) => {
                const exercise = exercises.find((e) => e.id === workoutExercise.exerciseId)
                if (!exercise) return null

                return (
                  <div key={exerciseIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <p className="text-sm text-gray-600">{exercise.category}</p>
                      </div>
                      <button
                        onClick={() => removeExercise(exerciseIndex)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-2 mb-3">
                      {workoutExercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex gap-2 items-center">
                          <span className="text-sm text-gray-600 w-12">Set {setIndex + 1}</span>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            placeholder="Reps"
                          />
                          <span className="text-sm text-gray-600">reps @</span>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(exerciseIndex, setIndex, 'weight', parseInt(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            placeholder="Weight"
                          />
                          <span className="text-sm text-gray-600">lbs</span>
                          {workoutExercise.sets.length > 1 && (
                            <button
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="text-red-600 hover:text-red-800 text-sm ml-2"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addSet(exerciseIndex)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Set
                    </button>

                    <div className="mt-3">
                      <input
                        type="text"
                        value={workoutExercise.notes}
                        onChange={(e) => {
                          const updated = [...selectedExercises]
                          updated[exerciseIndex].notes = e.target.value
                          setSelectedExercises(updated)
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Notes for this exercise..."
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={saveWorkout}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </div>
    </div>
  )
}
