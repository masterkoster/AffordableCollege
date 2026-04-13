"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type GuideOption = {
  majorCode: string
  majorName: string
  originSchoolCode: string
  originSchoolName: string
  targetSchoolCode: string
  targetSchoolName: string
}

interface Props {
  guides: GuideOption[]
}

export function FindTransferForm({ guides }: Props) {
  const router = useRouter()
  const [majorCode, setMajorCode] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [universityCode, setUniversityCode] = useState('')

  // Unique majors that actually have transfer guides
  const majors = useMemo(() => {
    const map = new Map<string, string>()
    guides.forEach((g) => {
      if (!map.has(g.majorCode)) map.set(g.majorCode, g.majorName)
    })
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [guides])

  // Schools that have a guide for the selected major
  const schoolsForMajor = useMemo(() => {
    if (!majorCode) return []
    const map = new Map<string, string>()
    guides
      .filter((g) => g.majorCode === majorCode)
      .forEach((g) => {
        if (!map.has(g.originSchoolCode)) map.set(g.originSchoolCode, g.originSchoolName)
      })
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [guides, majorCode])

  // Universities that have an agreement for the selected major + school
  const universitiesForSelection = useMemo(() => {
    if (!majorCode || !schoolCode) return []
    const map = new Map<string, string>()
    guides
      .filter((g) => g.majorCode === majorCode && g.originSchoolCode === schoolCode)
      .forEach((g) => {
        if (!map.has(g.targetSchoolCode)) map.set(g.targetSchoolCode, g.targetSchoolName)
      })
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [guides, majorCode, schoolCode])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (majorCode && schoolCode && universityCode) {
      router.push(`/find-transfer/${schoolCode}/${universityCode}/${majorCode}`)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="input-label">Desired Major</label>
        <select
          name="majorCode"
          className="input-field"
          value={majorCode}
          onChange={(e) => {
            setMajorCode(e.target.value)
            setSchoolCode('')
            setUniversityCode('')
          }}
          required
        >
          <option value="">Select your major...</option>
          {majors.map((major) => (
            <option key={major.code} value={major.code}>
              {major.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="input-label">Current School (Community College)</label>
        <select
          name="schoolCode"
          className="input-field"
          value={schoolCode}
          onChange={(e) => {
            setSchoolCode(e.target.value)
            setUniversityCode('')
          }}
          required
          disabled={!majorCode}
        >
          <option value="">Select your school...</option>
          {schoolsForMajor.map((school) => (
            <option key={school.code} value={school.code}>
              {school.name}
            </option>
          ))}
        </select>
        {!majorCode && <p className="text-xs text-slate-400 mt-1">Choose a major first to see matching schools.</p>}
      </div>

      <div>
        <label className="input-label">Target University</label>
        <select
          name="universityCode"
          className="input-field"
          value={universityCode}
          onChange={(e) => setUniversityCode(e.target.value)}
          required
          disabled={!majorCode || !schoolCode}
        >
          <option value="">Select university...</option>
          {universitiesForSelection.map((uni) => (
            <option key={uni.code} value={uni.code}>
              {uni.name}
            </option>
          ))}
        </select>
        {(!majorCode || !schoolCode) && (
          <p className="text-xs text-slate-400 mt-1">Pick a major and school to see available universities.</p>
        )}
      </div>

      <button
        type="submit"
        className="btn-primary w-full py-3"
        disabled={!majorCode || !schoolCode || !universityCode}
      >
        Find Transfer Guide
      </button>
    </form>
  )
}
