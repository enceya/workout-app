'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadUsers()
    loadPrograms()
  }, [])

  const loadUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select(`
        *,
        user_programs (
          program_id,
          workout_programs (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const loadPrograms = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workout_programs')
      .select('id, name')
      .order('name')
    
    if (data) setPrograms(data)
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean, userEmail: string) => {
    try {
      const supabase = createClient()
      // @ts-ignore - Type inference issue with Supabase client
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      setResult({ 
        success: true, 
        message: `${userEmail} is now ${!currentStatus ? 'an admin' : 'a regular user'}` 
      })
      loadUsers()
    } catch (error: any) {
      setResult({ success: false, message: `Error: ${error.message}` })
    }
  }

  const assignProgram = async (userId: string, programId: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('user_programs')
        .insert({
          user_id: userId,
          program_id: programId,
          assigned_by: user?.id
        } as any)

      if (error) throw error

      setResult({ success: true, message: 'Program assigned successfully' })
      loadUsers()
    } catch (error: any) {
      setResult({ success: false, message: `Error: ${error.message}` })
    }
  }

  const unassignProgram = async (userId: string, programId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_programs')
        .delete()
        .eq('user_id', userId)
        .eq('program_id', programId)

      if (error) throw error

      setResult({ success: true, message: 'Program unassigned successfully' })
      loadUsers()
    } catch (error: any) {
      setResult({ success: false, message: `Error: ${error.message}` })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

      {result && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            result.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {result.message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.email}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.is_admin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleAdmin(user.id, user.is_admin, user.email)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    user.is_admin
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
              </div>

              {/* Assigned Programs */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Programs:</h4>
                
                {user.user_programs && user.user_programs.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {user.user_programs.map((up: any) => (
                      <div
                        key={up.program_id}
                        className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{up.workout_programs.name}</span>
                        <button
                          onClick={() => unassignProgram(user.id, up.program_id)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">No programs assigned</p>
                )}

                {/* Assign Program Dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      assignProgram(user.id, e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="text-sm px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">+ Assign Program</option>
                  {programs
                    .filter(p => !user.user_programs?.some((up: any) => up.program_id === p.id))
                    .map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
