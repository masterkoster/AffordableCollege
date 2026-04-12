'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Types
interface Lead {
  id: string
  studentName: string
  studentEmail: string
  studentPhone: string | null
  gpa: number | null
  stage: string
  offerType: string | null
  scholarshipAmount: number | null
  offerSentAt: string | null
  createdAt: string
  guide: {
    originSchool: { name: string; code: string }
    targetSchool: { name: string }
    major: { name: string }
  }
  student: { name: string; email: string }
}

const STAGES = [
  { id: 'NEW_LEAD', label: 'New Lead', color: 'blue' },
  { id: 'CREDITS_VERIFIED', label: 'Credits Verified', color: 'amber' },
  { id: 'OFFER_SENT', label: 'Offer Sent', color: 'violet' },
  { id: 'ENROLLED', label: 'Enrolled', color: 'emerald' },
]

const STAGE_COLORS: Record<string, string> = {
  NEW_LEAD: 'bg-blue-50 border-blue-200 text-blue-700',
  CREDITS_VERIFIED: 'bg-amber-50 border-amber-200 text-amber-700',
  OFFER_SENT: 'bg-violet-50 border-violet-200 text-violet-700',
  ENROLLED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}

// Filter Sidebar
function FilterSidebar({
  filters,
  onChange,
  schools,
  majors,
}: {
  filters: Record<string, string>
  onChange: (key: string, value: string) => void
  schools: Array<{ id: string; name: string }>
  majors: Array<{ id: string; name: string }>
}) {
  return (
    <div className="w-64 bg-white border-r border-slate-200 p-4 space-y-6">
      <h3 className="font-semibold text-slate-900">Filters</h3>
      
      {/* GPA Filter */}
      <div>
        <label className="input-label">Minimum GPA</label>
        <select
          value={filters.minGpa || ''}
          onChange={(e) => onChange('minGpa', e.target.value)}
          className="input-field"
        >
          <option value="">Any GPA</option>
          <option value="3.0">≥ 3.0</option>
          <option value="3.5">≥ 3.5</option>
          <option value="3.8">≥ 3.8</option>
        </select>
      </div>

      {/* Origin School Filter */}
      <div>
        <label className="input-label">Community College</label>
        <select
          value={filters.originSchool || ''}
          onChange={(e) => onChange('originSchool', e.target.value)}
          className="input-field"
        >
          <option value="">All Schools</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Major Filter */}
      <div>
        <label className="input-label">Major</label>
        <select
          value={filters.major || ''}
          onChange={(e) => onChange('major', e.target.value)}
          className="input-field"
        >
          <option value="">All Majors</option>
          {majors.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Course Completion Filter */}
      <div>
        <label className="input-label">Course Completion</label>
        <select
          value={filters.hasCourse || ''}
          onChange={(e) => onChange('hasCourse', e.target.value)}
          className="input-field"
        >
          <option value="">Any</option>
          <option value="MTH161">Completed MTH 161 (Calc I)</option>
          <option value="CS150">Completed CS 150</option>
        </select>
      </div>

      <button
        onClick={() => {
          onChange('minGpa', '')
          onChange('originSchool', '')
          onChange('major', '')
          onChange('hasCourse', '')
        }}
        className="text-sm text-blue-600 hover:underline"
      >
        Clear Filters
      </button>
    </div>
  )
}

// Offer Modal
function OfferModal({
  lead,
  open,
  onClose,
  onSend,
}: {
  lead: Lead | null
  open: boolean
  onClose: () => void
  onSend: (leadId: string, offerType: string, amount: number) => void
}) {
  const [offerType, setOfferType] = useState('DIRECT_ACCEPTANCE')
  const [amount, setAmount] = useState(1000)

  if (!open || !lead) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Send Offer</h2>
        <p className="text-sm text-slate-500 mb-4">
          Send an offer to {lead.studentName}
        </p>

        <div className="space-y-4">
          <div>
            <label className="input-label">Offer Type</label>
            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              className="input-field"
            >
              <option value="DIRECT_ACCEPTANCE">Direct Acceptance</option>
              <option value="TRANSFER_SCHOLARSHIP">Transfer Scholarship</option>
            </select>
          </div>

          {offerType === 'TRANSFER_SCHOLARSHIP' && (
            <div>
              <label className="input-label">Scholarship Amount</label>
              <select
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input-field"
              >
                <option value={1000}>$1,000</option>
                <option value={2000}>$2,000</option>
                <option value={3000}>$3,000</option>
                <option value={5000}>$5,000</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={() => {
              onSend(lead.id, offerType, amount)
              onClose()
            }}
            className="btn-primary flex-1"
          >
            Send Offer
          </button>
        </div>
      </div>
    </div>
  )
}

// Lead Card
function LeadCard({ lead, onOffer }: { lead: Lead; onOffer: (lead: Lead) => void }) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-slate-900">{lead.studentName}</p>
          <p className="text-sm text-slate-500">{lead.studentEmail}</p>
        </div>
        {lead.gpa && (
          <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">
            GPA: {lead.gpa.toFixed(2)}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 mb-3">
        {lead.guide.originSchool.code} → {lead.guide.targetSchool.name} • {lead.guide.major.name}
      </div>
      <div className="flex gap-2">
        {lead.stage === 'NEW_LEAD' && (
          <button
            onClick={() => onOffer(lead)}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          >
            Send Offer
          </button>
        )}
        {lead.offerType && (
          <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
            {lead.offerType === 'DIRECT_ACCEPTANCE' ? 'Direct Accept' : `$${lead.scholarshipAmount}`}
          </span>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([])
  const [majors, setMajors] = useState<Array<{ id: string; name: string }>>([])
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, schoolsRes, majorsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/schools'),
        fetch('/api/majors'),
      ])

      if (leadsRes.status === 401) {
        router.push('/login')
        return
      }

      if (leadsRes.ok) {
        const data = await leadsRes.json()
        setLeads(data.leads)
      }
      if (schoolsRes.ok) {
        const data = await schoolsRes.json()
        setSchools(data.schools)
      }
      if (majorsRes.ok) {
        const data = await majorsRes.json()
        setMajors(data.majors)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const filteredLeads = leads.filter((lead) => {
    if (filters.minGpa && (!lead.gpa || lead.gpa < Number(filters.minGpa))) return false
    return true
  })

  const handleSendOffer = async (leadId: string, offerType: string, amount: number) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerType, scholarshipAmount: amount }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Failed to send offer:', err)
    }
  }

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <FilterSidebar
        filters={filters}
        onChange={handleFilterChange}
        schools={schools}
        majors={majors}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admissions Dashboard</h1>
              <p className="text-sm text-slate-500">{leads.length} total leads</p>
            </div>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700">
              Sign Out
            </button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage.id)
              return (
                <div key={stage.id} className="w-72">
                  <div className={`px-3 py-2 rounded-t-lg border-b-2 mb-3 ${STAGE_COLORS[stage.id]}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{stage.label}</span>
                      <span className="text-xs font-bold">{stageLeads.length}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onOffer={(l) => {
                          setSelectedLead(l)
                          setShowOfferModal(true)
                        }}
                      />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-sm text-slate-400">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal
        lead={selectedLead}
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSend={handleSendOffer}
      />
    </div>
  )
}
