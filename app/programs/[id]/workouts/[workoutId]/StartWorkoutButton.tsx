'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function StartWorkoutButton({ 
  workoutId, 
  workoutName,
  userId 
}: { 
  workoutId: string
  workoutName: string
  userId: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStartWorkout = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get the program workout with exercises
      const { data: programWorkout } = await supabase
        .from('program_workouts')
        .select(`
          *,
          program_workout_exercises (
            exercise_name,
            sets,
            reps,
            order_index
          )
        `)
        .eq('id', workoutId)
        .single()

      if (!programWorkout) throw new Error('Workout not found')

      // Create a new workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name: workoutName,
          date: new Date().toISOString(),
        } as any)
        .select()
        .single()

      if (workoutError) throw workoutError

      // Create workout exercises from the program template
      const exercises = (programWorkout as any).program_workout_exercises
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((ex: any) => ({
          workout_id: (workout as any).id,
          exercise_id: null, // We'll let them pick from existing or add custom
          custom_exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          weight: null,
          notes: '',
        }))

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercises as any)

      if (exercisesError) throw exercisesError

      // Redirect to the workout page to log actual performance
      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Error starting workout:', error)
      alert('Failed to start workout: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleStartWorkout}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
    >
      {loading ? 'Starting Workout...' : '🏋️ Start This Workout'}
    </button>
  )
}
