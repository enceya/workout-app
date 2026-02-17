import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">💪 Workout Tracker</h1>
            <p className="text-gray-600">Track your fitness journey</p>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  return <Dashboard user={user} />
}
