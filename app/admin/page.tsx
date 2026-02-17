'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminImport() {
  const [programData, setProgramData] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

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
        })
        .select()
        .single()

      if (programError) throw programError

      // Import phases
      for (const phaseData of data.phases) {
        const { data: phase, error: phaseError } = await supabase
          .from('program_phases')
          .insert({
            program_id: program.id,
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
              phase_id: phase.id,
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
            program_workout_id: workout.id,
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
    } catch (error: any) {
      setResult({ success: false, message: `Error: ${error.message}` })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Import Workout Program</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Program Data (JSON format)</h2>
          <textarea
            value={programData}
            onChange={(e) => setProgramData(e.target.value)}
            className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder={`{
  "name": "MAPS Symmetry",
  "description": "Program description",
  "total_weeks": 11,
  "phases": [
    {
      "phase_number": 1,
      "name": "Phase I",
      "objective": "Build strength and stability",
      "duration_weeks": 2,
      "workout_frequency_per_week": 5,
      "rest_between_sets_seconds": 60,
      "workouts": [
        {
          "workout_number": 1,
          "name": "Workout #1",
          "workout_type": "foundational",
          "notes": "",
          "exercises": [
            {
              "name": "Dunphy Squat Hold",
              "sets": 2,
              "reps": "15-second hold",
              "notes": ""
            }
          ]
        }
      ]
    }
  ]
}`}
          />
        </div>

        <button
          onClick={handleImport}
          disabled={importing}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {importing ? 'Importing...' : 'Import Program'}
        </button>

        {result && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Guide:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Paste your program data in JSON format above</li>
            <li>• Workout types: "foundational", "mobility", "trigger", "focus"</li>
            <li>• Reps can be numbers or text (e.g., "10 each leg", "15-second hold")</li>
            <li>• All workouts will be imported with their exercises in order</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
