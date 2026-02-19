import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import StartWorkoutButton from './StartWorkoutButton'

export default async function WorkoutDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; workoutId: string }> 
}) {
  const { id, workoutId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get workout with exercises
  const { data: workout } = await supabase
    .from('program_workouts')
    .select(`
      *,
      program_workout_exercises (
        id,
        exercise_name,
        order_index,
        sets,
        reps,
        notes
      ),
      program_phases (
        id,
        name,
        program_id
      )
    `)
    .eq('id', workoutId)
    .single()

  if (!workout) return notFound()

  const exercises = (workout as any).program_workout_exercises.sort(
    (a: any, b: any) => a.order_index - b.order_index
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            href={`/programs/${(workout as any).program_phases.program_id}`} 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to {(workout as any).program_phases.name}
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{(workout as any).name}</h1>
              <p className="text-gray-600 mt-1">{(workout as any).program_phases.name}</p>
              {(workout as any).notes && (
                <p className="text-sm text-gray-500 mt-2">{(workout as any).notes}</p>
              )}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full ${
              (workout as any).workout_type === 'foundational' ? 'bg-blue-100 text-blue-800' :
              (workout as any).workout_type === 'mobility' ? 'bg-green-100 text-green-800' :
              (workout as any).workout_type === 'trigger' ? 'bg-purple-100 text-purple-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {(workout as any).workout_type}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Exercises ({exercises.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {exercises.map((exercise: any, idx: number) => (
              <div key={exercise.id} className="p-6">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{exercise.exercise_name}</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Sets: {exercise.sets}</span>
                      <span>Reps: {exercise.reps}</span>
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">{exercise.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {user && (
          <StartWorkoutButton 
            workoutId={workoutId}
            workoutName={(workout as any).name}
            userId={user.id}
          />
        )}
      </div>
    </div>
  )
}
