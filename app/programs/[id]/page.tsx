import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get program
  const { data: program } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('id', id)
    .single()

  if (!program) return notFound()

  // Get phases with workouts
  const { data: phases } = await supabase
    .from('program_phases')
    .select(`
      *,
      program_workouts (
        id,
        workout_number,
        name,
        workout_type,
        notes
      )
    `)
    .eq('program_id', id)
    .order('phase_number')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/programs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Programs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
          {program.description && (
            <p className="text-gray-600 mt-2">{program.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">{program.total_weeks} weeks total</p>
        </div>

        {!phases || phases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No phases available for this program.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {phases.map((phase: any) => (
              <div key={phase.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">{phase.name}</h2>
                  <p className="text-gray-600 mt-1">{phase.objective}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>📅 {phase.duration_weeks} weeks</span>
                    <span>💪 {phase.workout_frequency_per_week}x per week</span>
                    <span>⏱️ {phase.rest_between_sets_seconds}s rest</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Workouts:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {phase.program_workouts
                      .sort((a: any, b: any) => {
                        if (a.workout_number !== b.workout_number) {
                          return a.workout_number - b.workout_number
                        }
                        return a.workout_type.localeCompare(b.workout_type)
                      })
                      .map((workout: any) => (
                        <Link
                          key={workout.id}
                          href={`/programs/${id}/workouts/${workout.id}`}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{workout.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              workout.workout_type === 'foundational' ? 'bg-blue-100 text-blue-800' :
                              workout.workout_type === 'mobility' ? 'bg-green-100 text-green-800' :
                              workout.workout_type === 'trigger' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {workout.workout_type}
                            </span>
                          </div>
                          {workout.notes && (
                            <p className="text-sm text-gray-600">{workout.notes}</p>
                          )}
                          <div className="mt-3 text-sm text-blue-600 font-medium">
                            View Details →
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
