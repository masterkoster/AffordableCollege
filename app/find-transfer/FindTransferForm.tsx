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

interface Props {
  guides: GuideOption[]
}

export function FindTransferForm({ guides }: Props) {
  const router = useRouter()
  const [majorId, setMajorId] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [universityId, setUniversityId] = useState('')

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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (majorId && schoolId && universityId) {
      router.push(`/find-transfer/${schoolId}/${universityId}/${majorId}`)
    }
  }

  return (
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
          onChange={(e) => setUniversityId(e.target.value)}
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

      <button
        type="submit"
        className="btn-primary w-full py-3"
        disabled={!majorId || !schoolId || !universityId}
      >
        Find Transfer Guide
      </button>
    </form>
  )
}
