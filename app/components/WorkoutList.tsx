'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Workout = {
  id: string
  name: string
  workout_date: string
  duration_minutes: number | null
  notes: string | null
}

type WorkoutExercise = {
  id: string
  order_index: number
  sets: any
  notes: string | null
  exercises: {
    name: string
    category: string
  }
}

export default function WorkoutList({ userId }: { userId: string }) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null)
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })

    if (data) setWorkouts(data)
    setLoading(false)
  }

  const loadWorkoutDetails = async (workoutId: string) => {
    const { data } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercises (
          name,
          category
        )
      `)
      .eq('workout_id', workoutId)
      .order('order_index')

    if (data) setWorkoutDetails(data as any)
  }

  const handleWorkoutClick = (workoutId: string) => {
    if (selectedWorkout === workoutId) {
      setSelectedWorkout(null)
      setWorkoutDetails([])
    } else {
      setSelectedWorkout(workoutId)
      loadWorkoutDetails(workoutId)
    }
  }

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    await supabase.from('workouts').delete().eq('id', workoutId)
    setWorkouts(workouts.filter(w => w.id !== workoutId))
    setSelectedWorkout(null)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading workouts...</div>
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-2">No workouts yet!</p>
        <p className="text-gray-500">Click "New Workout" to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div key={workout.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleWorkoutClick(workout.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(workout.workout_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {workout.duration_minutes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Duration: {workout.duration_minutes} minutes
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteWorkout(workout.id)
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>

          {selectedWorkout === workout.id && workoutDetails.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900 mb-3">Exercises</h4>
              <div className="space-y-3">
                {workoutDetails.map((exercise) => (
                  <div key={exercise.id} className="bg-white p-3 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">{exercise.exercises.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{exercise.exercises.category}</div>
                    <div className="space-y-1">
                      {Array.isArray(exercise.sets) && exercise.sets.map((set: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-700">
                          Set {idx + 1}: {set.reps} reps @ {set.weight} lbs
                          {set.completed && <span className="ml-2 text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                    {exercise.notes && (
                      <div className="mt-2 text-sm text-gray-600 italic">{exercise.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
