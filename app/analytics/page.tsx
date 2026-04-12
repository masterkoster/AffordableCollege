'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SchoolStats {
  schoolName: string
  schoolCode: string
  totalLeads: number
  mtaReady: number  // leads with GPA >= 2.8 (auto-admit threshold)
  enrolled: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<SchoolStats[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/analytics/mta')
        
        if (res.status === 401) {
          router.push('/login')
          return
        }

        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

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

  const maxLeads = Math.max(...stats.map(s => s.totalLeads), 1)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="font-bold text-slate-900">AffordableCollege</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
              <a href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-50">
                Pipeline
              </a>
              <a href="/analytics" className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">Analytics</a>
            </nav>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">MTA Match Analytics</h1>
          <p className="text-slate-500">Which community colleges are sending the most transfer-ready students.</p>
        </div>

        {/* Chart Card */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Leads by Community College</h2>
          
          {stats.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No data available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.map((school) => (
                <div key={school.schoolCode}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{school.schoolName}</span>
                    <span className="text-sm text-slate-500">{school.totalLeads} leads</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(school.totalLeads / maxLeads) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span>{school.mtaReady} MTA-Ready (GPA ≥ 2.8)</span>
                    <span>{school.enrolled} enrolled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Total Leads</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.reduce((sum, s) => sum + s.totalLeads, 0)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">MTA-Ready</p>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.reduce((sum, s) => sum + s.mtaReady, 0)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Enrolled</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.reduce((sum, s) => sum + s.enrolled, 0)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-500 uppercase">Conversion</p>
            <p className="text-2xl font-bold text-violet-600">
              {stats.reduce((sum, s) => sum + s.totalLeads, 0) > 0
                ? Math.round((stats.reduce((sum, s) => sum + s.enrolled, 0) / stats.reduce((sum, s) => sum + s.totalLeads, 0)) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
