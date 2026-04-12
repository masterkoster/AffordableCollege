'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  code: string
  name: string
  credits: number
}

interface StudentLead {
  id: string
  stage: string
  offerType: string | null
  scholarshipAmount: number | null
  offerSentAt: string | null
  createdAt: string
  guide: {
    originSchool: { name: string; code: string }
    targetSchool: { name: string }
    major: { name: string }
    requirements: string
    autoAdmitGPA: number | null
    courses: Array<{ code: string; name: string; credits: number }>
  }
}

const STAGE_LABELS: Record<string, { label: string; description: string; color: string }> = {
  NEW_LEAD: { label: 'Application Submitted', description: 'Your transfer application has been received.', color: 'blue' },
  CREDITS_VERIFIED: { label: 'Credits Verified', description: 'Your transfer credits are being reviewed.', color: 'amber' },
  OFFER_SENT: { label: 'Offer Sent', description: 'You have received an offer! Check your email.', color: 'violet' },
  ENROLLED: { label: 'Enrolled', description: 'Welcome to the university!', color: 'emerald' },
}

export default function StudentPortalPage() {
  const [leads, setLeads] = useState<StudentLead[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/students/leads')
      
      if (res.status === 401) {
        router.push('/login')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads)
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="font-bold text-slate-900">AffordableCollege</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Transfer Applications</h1>
          <p className="text-slate-500">Track your transfer progress to universities.</p>
        </div>

        {leads.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No Applications Yet</h2>
            <p className="text-slate-500 mb-6">Find a transfer guide and apply to start your transfer journey.</p>
            <a href="/find-transfer" className="btn-primary inline-block">
              Find Transfer Guide
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {leads.map((lead) => {
              const stageInfo = STAGE_LABELS[lead.stage] || STAGE_LABELS.NEW_LEAD
              const courses: Course[] = typeof lead.guide.courses === 'string' ? JSON.parse(lead.guide.courses) : lead.guide.courses
              
              return (
                <div key={lead.id} className="card overflow-hidden">
                  {/* Header with stage */}
                  <div className={`px-6 py-4 border-b border-slate-200 bg-${stageInfo.color}-50`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {lead.guide.originSchool.code} → {lead.guide.targetSchool.name}
                        </h3>
                        <p className="text-sm text-slate-600">{lead.guide.major.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${stageInfo.color}-100 text-${stageInfo.color}-700`}>
                          {stageInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">{stageInfo.description}</p>

                    {lead.offerType && (
                      <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="font-medium text-emerald-900">
                          {lead.offerType === 'DIRECT_ACCEPTANCE' 
                            ? '🎉 Congratulations! You have been accepted!' 
                            : `🎉 Congratulations! You received a $${lead.scholarshipAmount} transfer scholarship!`}
                        </p>
                      </div>
                    )}

                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Requirements</h4>
                      <p className="text-sm text-slate-600">{lead.guide.requirements}</p>
                    </div>

                    {/* Courses Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">
                        Required Courses ({courses.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {courses.slice(0, 8).map((course, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                            {course.code}
                          </span>
                        ))}
                        {courses.length > 8 && (
                          <span className="text-xs px-2 py-1 text-slate-400">
                            +{courses.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/find-transfer" className="text-sm text-blue-600 hover:underline">
            Apply to another transfer guide →
          </a>
        </div>
      </main>
    </div>
  )
}
