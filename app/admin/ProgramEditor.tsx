'use client'

import { useState } from 'react'

interface Exercise {
  name: string
  sets: number
  reps: string
  notes: string
}

interface Workout {
  workout_number: number
  name: string
  workout_type: string
  notes: string
  exercises: Exercise[]
}

interface Phase {
  phase_number: number
  name: string
  objective: string
  duration_weeks: number
  workout_frequency_per_week: number
  rest_between_sets_seconds: number
  workouts: Workout[]
}

interface ProgramData {
  name: string
  description: string
  total_weeks: number
  phases: Phase[]
}

export default function ProgramEditor({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData: ProgramData
  onSave: (data: ProgramData) => void
  onCancel: () => void 
}) {
  const [data, setData] = useState<ProgramData>(initialData)
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0)
  const [expandedWorkout, setExpandedWorkout] = useState<{ phaseIdx: number, workoutIdx: number } | null>(null)

  const updateProgram = (field: keyof ProgramData, value: any) => {
    setData({ ...data, [field]: value })
  }

  const updatePhase = (phaseIdx: number, field: keyof Phase, value: any) => {
    const newPhases = [...data.phases]
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], [field]: value }
    setData({ ...data, phases: newPhases })
  }

  const updateWorkout = (phaseIdx: number, workoutIdx: number, field: keyof Workout, value: any) => {
    const newPhases = [...data.phases]
    const newWorkouts = [...newPhases[phaseIdx].workouts]
    newWorkouts[workoutIdx] = { ...newWorkouts[workoutIdx], [field]: value }
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], workouts: newWorkouts }
    setData({ ...data, phases: newPhases })
  }

  const updateExercise = (phaseIdx: number, workoutIdx: number, exerciseIdx: number, field: keyof Exercise, value: any) => {
    const newPhases = [...data.phases]
    const newWorkouts = [...newPhases[phaseIdx].workouts]
    const newExercises = [...newWorkouts[workoutIdx].exercises]
    newExercises[exerciseIdx] = { ...newExercises[exerciseIdx], [field]: value }
    newWorkouts[workoutIdx] = { ...newWorkouts[workoutIdx], exercises: newExercises }
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], workouts: newWorkouts }
    setData({ ...data, phases: newPhases })
  }

  const deleteExercise = (phaseIdx: number, workoutIdx: number, exerciseIdx: number) => {
    const newPhases = [...data.phases]
    const newWorkouts = [...newPhases[phaseIdx].workouts]
    newWorkouts[workoutIdx].exercises.splice(exerciseIdx, 1)
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], workouts: newWorkouts }
    setData({ ...data, phases: newPhases })
  }

  const addExercise = (phaseIdx: number, workoutIdx: number) => {
    const newPhases = [...data.phases]
    const newWorkouts = [...newPhases[phaseIdx].workouts]
    newWorkouts[workoutIdx].exercises.push({ name: '', sets: 2, reps: '10', notes: '' })
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], workouts: newWorkouts }
    setData({ ...data, phases: newPhases })
  }

  const addWorkout = (phaseIdx: number) => {
    const newPhases = [...data.phases]
    const currentWorkouts = newPhases[phaseIdx].workouts
    const nextWorkoutNumber = currentWorkouts.length > 0 
      ? Math.max(...currentWorkouts.map(w => w.workout_number)) + 1 
      : 1
    
    newPhases[phaseIdx].workouts.push({
      workout_number: nextWorkoutNumber,
      name: `Workout #${nextWorkoutNumber}`,
      workout_type: 'foundational',
      notes: '',
      exercises: []
    })
    setData({ ...data, phases: newPhases })
  }

  const deleteWorkout = (phaseIdx: number, workoutIdx: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) return
    const newPhases = [...data.phases]
    newPhases[phaseIdx].workouts.splice(workoutIdx, 1)
    setData({ ...data, phases: newPhases })
  }

  const addPhase = () => {
    const nextPhaseNumber = data.phases.length > 0 
      ? Math.max(...data.phases.map(p => p.phase_number)) + 1 
      : 1
    
    const newPhase: Phase = {
      phase_number: nextPhaseNumber,
      name: `Phase ${nextPhaseNumber}`,
      objective: '',
      duration_weeks: 2,
      workout_frequency_per_week: 5,
      rest_between_sets_seconds: 60,
      workouts: []
    }
    setData({ ...data, phases: [...data.phases, newPhase] })
  }

  const deletePhase = (phaseIdx: number) => {
    if (!confirm('Are you sure you want to delete this phase?')) return
    const newPhases = [...data.phases]
    newPhases.splice(phaseIdx, 1)
    setData({ ...data, phases: newPhases })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Program</h2>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Program Info */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateProgram('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={data.description}
                onChange={(e) => updateProgram('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Weeks</label>
              <input
                type="number"
                value={data.total_weeks}
                onChange={(e) => updateProgram('total_weeks', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Phases</h3>
              <button
                onClick={addPhase}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Add Phase
              </button>
            </div>
            {data.phases.map((phase, phaseIdx) => (
              <div key={phaseIdx} className="border border-gray-300 rounded-lg">
                <button
                  onClick={() => setExpandedPhase(expandedPhase === phaseIdx ? null : phaseIdx)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex justify-between items-center"
                >
                  <span className="font-semibold">{phase.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePhase(phaseIdx)
                      }}
                      className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                    >
                      Delete Phase
                    </button>
                    <span>{expandedPhase === phaseIdx ? '▼' : '▶'}</span>
                  </div>
                </button>

                {expandedPhase === phaseIdx && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phase Name</label>
                        <input
                          type="text"
                          value={phase.name}
                          onChange={(e) => updatePhase(phaseIdx, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                        <input
                          type="number"
                          value={phase.duration_weeks}
                          onChange={(e) => updatePhase(phaseIdx, 'duration_weeks', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                      <input
                        type="text"
                        value={phase.objective}
                        onChange={(e) => updatePhase(phaseIdx, 'objective', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    {/* Workouts */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Workouts</h4>
                        <button
                          onClick={() => addWorkout(phaseIdx)}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          + Add Workout
                        </button>
                      </div>
                      {phase.workouts.map((workout, workoutIdx) => (
                        <div key={workoutIdx} className="border border-gray-200 rounded-lg mb-3">
                          <button
                            onClick={() => {
                              const key = { phaseIdx, workoutIdx }
                              setExpandedWorkout(
                                expandedWorkout?.phaseIdx === phaseIdx && expandedWorkout?.workoutIdx === workoutIdx 
                                  ? null 
                                  : key
                              )
                            }}
                            className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-t-lg flex justify-between items-center"
                          >
                            <span className="text-sm font-medium">{workout.name}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteWorkout(phaseIdx, workoutIdx)
                                }}
                                className="text-red-600 hover:text-red-800 px-2 text-xs"
                              >
                                Delete
                              </button>
                              <span className="text-xs">
                                {expandedWorkout?.phaseIdx === phaseIdx && expandedWorkout?.workoutIdx === workoutIdx ? '▼' : '▶'}
                              </span>
                            </div>
                          </button>

                          {expandedWorkout?.phaseIdx === phaseIdx && expandedWorkout?.workoutIdx === workoutIdx && (
                            <div className="p-3 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Workout Name</label>
                                  <input
                                    type="text"
                                    value={workout.name}
                                    onChange={(e) => updateWorkout(phaseIdx, workoutIdx, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                  <select
                                    value={workout.workout_type}
                                    onChange={(e) => updateWorkout(phaseIdx, workoutIdx, 'workout_type', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="foundational">Foundational</option>
                                    <option value="mobility">Mobility</option>
                                    <option value="trigger">Trigger</option>
                                    <option value="focus">Focus</option>
                                  </select>
                                </div>
                              </div>

                              {/* Exercises */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="block text-xs font-medium text-gray-700">Exercises</label>
                                  <button
                                    onClick={() => addExercise(phaseIdx, workoutIdx)}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    + Add Exercise
                                  </button>
                                </div>
                                {workout.exercises.map((exercise, exerciseIdx) => (
                                  <div key={exerciseIdx} className="grid grid-cols-12 gap-2 mb-2 items-start">
                                    <input
                                      type="text"
                                      value={exercise.name}
                                      onChange={(e) => updateExercise(phaseIdx, workoutIdx, exerciseIdx, 'name', e.target.value)}
                                      placeholder="Exercise name"
                                      className="col-span-5 px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                    <input
                                      type="number"
                                      value={exercise.sets}
                                      onChange={(e) => updateExercise(phaseIdx, workoutIdx, exerciseIdx, 'sets', parseInt(e.target.value))}
                                      placeholder="Sets"
                                      className="col-span-2 px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={exercise.reps}
                                      onChange={(e) => updateExercise(phaseIdx, workoutIdx, exerciseIdx, 'reps', e.target.value)}
                                      placeholder="Reps"
                                      className="col-span-3 px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                    <button
                                      onClick={() => deleteExercise(phaseIdx, workoutIdx, exerciseIdx)}
                                      className="col-span-2 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(data)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
