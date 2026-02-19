'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProgramEditor from './ProgramEditor'
import UserManagement from './UserManagement'

export default function AdminImport() {
  const [programData, setProgramData] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProgram, setEditingProgram] = useState<any>(null)
  const [editedData, setEditedData] = useState('')

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workout_programs')
      .select(`
        *,
        program_phases (count)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setPrograms(data)
    setLoading(false)
  }

  const handleDelete = async (programId: string, programName: string) => {
    if (!confirm(`Are you sure you want to delete "${programName}"? This will delete all phases, workouts, and exercises.`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', programId)

      if (error) throw error

      // Reload the page to show updated list
      window.location.reload()
    } catch (error: any) {
      setResult({ success: false, message: `Error: ${error.message}` })
    }
  }

  const loadProgramData = async (programId: string) => {
    try {
      const supabase = createClient()
      
      // Get full program with all nested data
      const { data: program } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('id', programId)
        .single()

      const { data: phases } = await supabase
        .from('program_phases')
        .select(`
          *,
          program_workouts (
            *,
            program_workout_exercises (*)
          )
        `)
        .eq('program_id', programId)
        .order('phase_number')

      // Format as JSON for editing
      const formattedData = {
        name: (program as any).name,
        description: (program as any).description,
        total_weeks: (program as any).total_weeks,
        phases: (phases as any[]).map((phase: any) => ({
          phase_number: phase.phase_number,
          name: phase.name,
          objective: phase.objective,
          duration_weeks: phase.duration_weeks,
          workout_frequency_per_week: phase.workout_frequency_per_week,
          rest_between_sets_seconds: phase.rest_between_sets_seconds,
          workouts: phase.program_workouts.map((workout: any) => ({
            workout_number: workout.workout_number,
            name: workout.name,
            workout_type: workout.workout_type,
            notes: workout.notes,
            exercises: workout.program_workout_exercises.map((ex: any) => ({
              name: ex.exercise_name,
              sets: ex.sets,
              reps: ex.reps,
              notes: ex.notes
            }))
          }))
        }))
      }

      setEditedData(JSON.stringify(formattedData, null, 2))
      setEditingProgram(program)
    } catch (error: any) {
      setResult({ success: false, message: `Error loading program: ${error.message}` })
    }
  }

  const handleUpdate = async () => {
    if (!editingProgram || !editedData) return

    try {
      const supabase = createClient()
      const data = JSON.parse(editedData)
      
      // Delete the old program (cascade will delete everything)
      await supabase
        .from('workout_programs')
        .delete()
        .eq('id', (editingProgram as any).id)

      // Re-import with new data (reuse the import logic)
      
      // Import program
      const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          name: data.name,
          description: data.description,
          total_weeks: data.total_weeks,
        } as any)
        .select()
        .single()

      if (programError) throw programError

      // Import phases (same as import function)
      for (const phaseData of data.phases) {
        const { data: phase, error: phaseError } = await supabase
          .from('program_phases')
          .insert({
            program_id: (program as any).id,
            phase_number: phaseData.phase_number,
            name: phaseData.name,
            objective: phaseData.objective,
            duration_weeks: phaseData.duration_weeks,
            workout_frequency_per_week: phaseData.workout_frequency_per_week,
            rest_between_sets_seconds: phaseData.rest_between_sets_seconds,
          } as any)
          .select()
          .single()

        if (phaseError) throw phaseError

        for (const workoutData of phaseData.workouts) {
          const { data: workout, error: workoutError } = await supabase
            .from('program_workouts')
            .insert({
              phase_id: (phase as any).id,
              workout_number: workoutData.workout_number,
              name: workoutData.name,
              workout_type: workoutData.workout_type,
              notes: workoutData.notes,
            } as any)
            .select()
            .single()

          if (workoutError) throw workoutError

          const exercises = workoutData.exercises.map((ex: any, idx: number) => ({
            program_workout_id: (workout as any).id,
            exercise_name: ex.name,
            order_index: idx,
            sets: ex.sets,
            reps: ex.reps,
            notes: ex.notes || '',
          }))

          const { error: exercisesError } = await supabase
            .from('program_workout_exercises')
            .insert(exercises as any)

          if (exercisesError) throw exercisesError
        }
      }

      setResult({ success: true, message: `Successfully updated ${data.name}!` })
      setEditingProgram(null)
      setEditedData('')
      loadPrograms()
    } catch (error: any) {
      setResult({ success: false, message: `Error: ${error.message}` })
    }
  }

  const handleImport = async () => {
    if (!programData.trim()) {
      setResult({ success: false, message: 'Please paste program data' })
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const data = JSON.parse(programData)
      const supabase = createClient()

      // Import program
      const { data: program, error: programError } = await supabase
        .from('workout_programs')
        .insert({
          name: data.name,
          description: data.description,
          total_weeks: data.total_weeks,
        } as any)
        .select()
        .single()

      if (programError) throw programError

      // Import phases
      for (const phaseData of data.phases) {
        const { data: phase, error: phaseError } = await supabase
          .from('program_phases')
          .insert({
            program_id: (program as any).id,
            phase_number: phaseData.phase_number,
            name: phaseData.name,
            objective: phaseData.objective,
            duration_weeks: phaseData.duration_weeks,
            workout_frequency_per_week: phaseData.workout_frequency_per_week,
            rest_between_sets_seconds: phaseData.rest_between_sets_seconds,
          } as any)
          .select()
          .single()

        if (phaseError) throw phaseError

        // Import workouts for this phase
        for (const workoutData of phaseData.workouts) {
          const { data: workout, error: workoutError } = await supabase
            .from('program_workouts')
            .insert({
              phase_id: (phase as any).id,
              workout_number: workoutData.workout_number,
              name: workoutData.name,
              workout_type: workoutData.workout_type,
              notes: workoutData.notes,
            } as any)
            .select()
            .single()

          if (workoutError) throw workoutError

          // Import exercises for this workout
          const exercises = workoutData.exercises.map((ex: any, idx: number) => ({
            program_workout_id: (workout as any).id,
            exercise_name: ex.name,
            order_index: idx,
            sets: ex.sets,
            reps: ex.reps,
            notes: ex.notes,
          }))

          const { error: exercisesError } = await supabase
            .from('program_workout_exercises')
            .insert(exercises as any)

          if (exercisesError) throw exercisesError
        }
      }

      setResult({ success: true, message: `Successfully imported ${data.name}!` })
      setProgramData('')
      loadPrograms() // Refresh the list
    } catch (error: any) {
      setResult({ success: false, message: `Error: ${error.message}` })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <a
            href="/"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* User Management Section */}
        <div className="mb-8">
          <UserManagement />
        </div>

        {/* Program Import Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Workout Program</h2>
          
          <textarea
            value={programData}
            onChange={(e) => setProgramData(e.target.value)}
            className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm mb-4"
            placeholder={`{
  "name": "MAPS Symmetry",
  "description": "Program description",
  "total_weeks": 11,
  "phases": [...]
}`}
          />

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {importing ? 'Importing...' : 'Import Program'}
          </button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {result.message}
            </div>
          )}
        </div>

        {/* Existing Programs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Programs</h2>
          {loading ? (
            <p className="text-gray-600">Loading programs...</p>
          ) : programs.length === 0 ? (
            <p className="text-gray-600">No programs yet. Import one above!</p>
          ) : (
            <div className="space-y-3">
              {programs.map((program: any) => (
                <div
                  key={program.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{program.name}</h3>
                    <p className="text-sm text-gray-600">
                      {program.program_phases?.[0]?.count || 0} phases • {program.total_weeks} weeks
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadProgramData(program.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(program.id, program.name)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingProgram && (
          <ProgramEditor
            initialData={JSON.parse(editedData)}
            onSave={(data) => {
              setEditedData(JSON.stringify(data, null, 2))
              handleUpdate()
            }}
            onCancel={() => {
              setEditingProgram(null)
              setEditedData('')
            }}
          />
        )}
      </div>
    </div>
  )
}
