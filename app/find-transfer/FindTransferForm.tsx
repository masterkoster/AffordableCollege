"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type GuideOption = {
  majorId: string
  majorName: string
  originSchoolId: string
  originSchoolName: string
  targetSchoolId: string
  targetSchoolName: string
}

type SchoolTuition = {
  id: string
  code: string
  name: string
  type: string
  inStatePerCredit: number | null
  outStatePerCredit: number | null
}

interface Props {
  guides: GuideOption[]
  tuitionData: SchoolTuition[]
}

export function FindTransferForm({ guides, tuitionData }: Props) {
  const router = useRouter()
  const [majorId, setMajorId] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [compareUniversityId, setCompareUniversityId] = useState('')

  // Unique majors that actually have transfer guides
  const majors = useMemo(() => {
    const map = new Map<string, string>()
    guides.forEach((g) => {
      if (!map.has(g.majorId)) map.set(g.majorId, g.majorName)
    })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [guides])

  // Schools that have a guide for the selected major
  const schoolsForMajor = useMemo(() => {
    if (!majorId) return []
    const map = new Map<string, string>()
    guides
      .filter((g) => g.majorId === majorId)
      .forEach((g) => {
        if (!map.has(g.originSchoolId)) map.set(g.originSchoolId, g.originSchoolName)
      })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [guides, majorId])

  // Universities that have an agreement for the selected major + school
  const universitiesForSelection = useMemo(() => {
    if (!majorId || !schoolId) return []
    const map = new Map<string, string>()
    guides
      .filter((g) => g.majorId === majorId && g.originSchoolId === schoolId)
      .forEach((g) => {
        if (!map.has(g.targetSchoolId)) map.set(g.targetSchoolId, g.targetSchoolName)
      })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [guides, majorId, schoolId])

  // Universities available for comparison (excluding the primary selection)
  const compareUniversities = useMemo(() => {
    if (!majorId || !schoolId || !universityId) return []
    const map = new Map<string, string>()
    guides
      .filter((g) => g.majorId === majorId && g.originSchoolId === schoolId && g.targetSchoolId !== universityId)
      .forEach((g) => {
        if (!map.has(g.targetSchoolId)) map.set(g.targetSchoolId, g.targetSchoolName)
      })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [guides, majorId, schoolId, universityId])

  // Get tuition data for cost calculation
  const getTuition = (schoolId: string) => {
    const school = tuitionData.find((s) => s.id === schoolId)
    return school?.inStatePerCredit ?? 0
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (majorId && schoolId && universityId) {
      // Build URL with query params for comparison
      const params = new URLSearchParams()
      params.set('university', universityId)
      if (compareMode && compareUniversityId) {
        params.set('compare', compareUniversityId)
      }
      router.push(`/find-transfer/${schoolId}/${universityId}/${majorId}?${params.toString()}`)
    }
  }

  const selectedUniversityTuition = universityId ? getTuition(universityId) : 0
  const compareUniversityTuition = compareUniversityId ? getTuition(compareUniversityId) : 0

  return (
    <div>
      {/* Compare Toggle */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <span className="text-sm font-medium text-slate-700">Compare Universities</span>
        <button
          type="button"
          onClick={() => {
            setCompareMode(!compareMode)
            if (!compareMode) setCompareUniversityId('')
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            compareMode ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              compareMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="input-label">Desired Major</label>
          <select
            name="majorId"
            className="input-field"
            value={majorId}
            onChange={(e) => {
              setMajorId(e.target.value)
              setSchoolId('')
              setUniversityId('')
              setCompareUniversityId('')
            }}
            required
          >
            <option value="">Select your major...</option>
            {majors.map((major) => (
              <option key={major.id} value={major.id}>
                {major.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Current School (Community College)</label>
          <select
            name="schoolId"
            className="input-field"
            value={schoolId}
            onChange={(e) => {
              setSchoolId(e.target.value)
              setUniversityId('')
              setCompareUniversityId('')
            }}
            required
            disabled={!majorId}
          >
            <option value="">Select your school...</option>
            {schoolsForMajor.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
          {!majorId && <p className="text-xs text-slate-400 mt-1">Choose a major first to see matching schools.</p>}
        </div>

        <div>
          <label className="input-label">Target University</label>
          <select
            name="universityId"
            className="input-field"
            value={universityId}
            onChange={(e) => {
              setUniversityId(e.target.value)
              setCompareUniversityId('')
            }}
            required
            disabled={!majorId || !schoolId}
          >
            <option value="">Select university...</option>
            {universitiesForSelection.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </select>
          {(!majorId || !schoolId) && (
            <p className="text-xs text-slate-400 mt-1">Pick a major and school to see available universities.</p>
          )}
        </div>

        {/* Comparison University Selector */}
        {compareMode && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="input-label text-blue-800">Compare With (Optional)</label>
            <select
              name="compareUniversityId"
              className="input-field bg-white border-blue-300"
              value={compareUniversityId}
              onChange={(e) => setCompareUniversityId(e.target.value)}
              disabled={!majorId || !schoolId || !universityId}
            >
              <option value="">Select university to compare...</option>
              {compareUniversities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
            {compareUniversityId && (
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-slate-700">Primary</p>
                  <p className="text-2xl font-bold text-blue-600">${selectedUniversityTuition.toFixed(2)}</p>
                  <p className="text-slate-500">per credit</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-slate-700">Compare</p>
                  <p className="text-2xl font-bold text-green-600">${compareUniversityTuition.toFixed(2)}</p>
                  <p className="text-slate-500">per credit</p>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-3"
          disabled={!majorId || !schoolId || !universityId}
        >
          {compareMode && compareUniversityId ? 'View Comparison' : 'Find Transfer Guide'}
        </button>
      </form>
    </div>
  )
}
