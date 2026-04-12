'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [guideId, setGuideId] = useState<string | null>(null)
  const [currentSchoolId, setCurrentSchoolId] = useState('')
  const [gpa, setGpa] = useState('')
  const [phone, setPhone] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const router = useRouter()
  
  // Get guideId from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gId = params.get('guideId')
    if (gId) {
      setGuideId(gId)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'STUDENT' }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // If there's a guideId, show the application form
      if (guideId) {
        setShowApplyForm(true)
      } else {
        router.push('/students')
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplyError('')
    setApplyLoading(true)

    try {
      const res = await fetch('/api/leads/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId,
          studentName: name,
          studentEmail: email,
          studentPhone: phone || undefined,
          gpa: gpa ? parseFloat(gpa) : undefined,
          currentSchoolId: currentSchoolId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply')
      }

      router.push('/students')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply'
      setApplyError(message)
    } finally {
      setApplyLoading(false)
    }
  }

  // Show application form after signup if guideId exists
  if (showApplyForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <span className="text-2xl font-bold text-slate-900">AffordableCollege</span>
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Complete Your Application</h1>
            <p className="text-slate-500 mb-6">Tell us a bit more about your transfer journey</p>

            {applyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="input-label">Current School (Optional)</label>
                <select
                  value={currentSchoolId}
                  onChange={(e) => setCurrentSchoolId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select your community college</option>
                  <option value="occ">Oakland Community College (OCC)</option>
                  <option value="macomb">Macomb Community College</option>
                  <option value="schoolcraft">Schoolcraft College</option>
                  <option value="wayne">Wayne County Community College</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="input-label">Current GPA (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="input-field"
                  placeholder="3.5"
                />
                <p className="text-xs text-slate-400 mt-1">If you haven't started yet, leave blank</p>
              </div>

              <div>
                <label className="input-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="(555) 123-4567"
                />
              </div>

              <button
                type="submit"
                disabled={applyLoading}
                className="btn-primary w-full py-3"
              >
                {applyLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              <button 
                onClick={() => router.push('/students')} 
                className="text-blue-600 font-medium hover:underline"
              >
                Skip for now
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="text-2xl font-bold text-slate-900">AffordableCollege</span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 mb-6">Start your transfer journey today</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
