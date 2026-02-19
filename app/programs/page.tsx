import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProgramsPage() {
  const supabase = await createClient()
  
  const { data: programs } = await supabase
    .from('workout_programs')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Workout Programs</h1>
          <p className="text-gray-600 mt-2">Choose a program to follow</p>
        </div>

        {!programs || programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No programs available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Import programs from the admin page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program: any) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">{program.name}</h2>
                {program.description && (
                  <p className="text-gray-600 text-sm mb-4">{program.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <span>{program.total_weeks} weeks</span>
                </div>
                <div className="mt-4 text-blue-600 font-medium text-sm">
                  View Program →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
