'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import WorkoutList from './WorkoutList'
import NewWorkout from './NewWorkout'

type Exercise = {
  id: string
  name: string
  category: string
  equipment: string | null
  description: string | null
}

export default function Dashboard({ user }: { user: User }) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showNewWorkout, setShowNewWorkout] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name')

    if (data) setExercises(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">💪 Workout Tracker</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Workouts</h2>
          <div className="flex gap-3">
            <a
              href="/admin"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              ⚙️ Admin
            </a>
            <a
              href="/programs"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              📚 Programs
            </a>
            <button
              onClick={() => setShowNewWorkout(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + New Workout
            </button>
          </div>
        </div>

        {showNewWorkout && (
          <NewWorkout
            exercises={exercises}
            onClose={() => setShowNewWorkout(false)}
            userId={user.id}
          />
        )}

        <WorkoutList userId={user.id} />
      </main>
    </div>
  )
}
