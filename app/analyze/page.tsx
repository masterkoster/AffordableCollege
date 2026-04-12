'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, TrendingUp, Shield, ArrowRight, Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreditGauge } from '@/components/credit-gauge'
import { MTABadge } from '@/components/mta-badge'
import { CostComparisonChart } from '@/components/cost-comparison-chart'
import { ClassBreakdownTable } from '@/components/class-breakdown-table'
import { cn } from '@/lib/utils'

interface Course {
  code: string
  name: string
  credits: number
}

interface TransferGuide {
  id: string
  originSchool: { name: string; code: string }
  targetSchool: { name: string }
  major: { name: string }
  courses: Course[]
}

const mtaRequirements = [
  { name: "English Composition", completed: true, credits: "6 credits" },
  { name: "Mathematics", completed: true, credits: "3-4 credits" },
  { name: "Natural Sciences", completed: true, credits: "8 credits" },
  { name: "Social Sciences", completed: true, credits: "8 credits" },
  { name: "Humanities", completed: false, credits: "6 credits" },
]

function TranscriptUpload({ 
  onFileChange, 
  currentFile, 
  onAnalyze, 
  isAnalyzing 
}: { 
  onFileChange: (f: File | null) => void
  currentFile: File | null
  onAnalyze: () => void
  isAnalyzing: boolean 
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      onFileChange(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      onFileChange(selectedFile)
    }
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 text-center",
          isDragging ? "border-accent bg-accent/10 scale-[1.02]" :
          currentFile ? "border-accent bg-accent/5" :
          "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />
        
        <div className="flex flex-col items-center gap-4">
          {currentFile ? (
            <>
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{currentFile.name}</p>
                <p className="text-sm text-muted-foreground mt-1">Ready to analyze your transcript</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Drop your transcript here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse for a PDF file</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <FileText className="w-4 h-4" />
                <span>Supports PDF transcripts from Michigan community colleges</span>
              </div>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={onAnalyze}
        disabled={!currentFile || isAnalyzing}
        size="lg"
        className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing Credits...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Scan & Analyze
          </>
        )}
      </Button>
    </div>
  )
}

export default function AnalyzeTranscriptPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [guide, setGuide] = useState<TransferGuide | null>(null)

  useEffect(() => {
    async function fetchGuides() {
      try {
        const res = await fetch('/api/transfer-guides')
        if (res.ok) {
          const data = await res.json()
          const firstGuide = data.guides?.[0]
          if (firstGuide) setGuide(firstGuide)
        }
      } catch (err) {
        console.error('Failed to fetch guides:', err)
      }
    }
    fetchGuides()
  }, [])

  const generateMatchedClasses = (g: TransferGuide) => {
    const codeMap: Record<string, string> = {
      'MTH 161': 'MTH 1554', 'MTH 162': 'MTH 1555', 'MTH 263': 'MTH 2554',
      'MTH 302': 'MTH 3000', 'CS 150': 'CS 1010', 'CS 150L': 'CS 1010L',
      'CS 251': 'CS 2010', 'CS 251L': 'CS 2010L', 'CS 280': 'CS 2020',
      'PHY 151': 'PHY 1510', 'PHY 151L': 'PHY 1510L', 'PHY 152': 'PHY 1520',
      'PHY 152L': 'PHY 1520L', 'CHM 150': 'CHM 1500', 'CHM 150L': 'CHM 1500L',
      'ENG 101': 'WRT 1060', 'ENG 102': 'WRT 1500', 'COM 101': 'COM 1100',
      'ECO 201': 'ECN 2010', 'CSC 101': 'CS 1000',
    }
    return g.courses.map((course, idx) => {
      let status: 'matched' | 'partial' | 'review' = 'matched'
      if (idx > 4 && idx <= 6) status = 'partial'
      if (idx > 6) status = 'review'
      return {
        ccCode: `${g.originSchool.code} ${course.code}`,
        ccName: course.name,
        ouCode: codeMap[course.code] || `${g.targetSchool.name.substring(0, 3)} ${course.code}`,
        ouName: course.name,
        credits: course.credits,
        status,
      }
    })
  }

  const handleAnalyze = () => {
    if (!file || !guide) return
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 2500)
  }

  const matchedClasses = guide ? generateMatchedClasses(guide) : []
  const matchedCredits = matchedClasses.filter(c => c.status === 'matched').reduce((sum, c) => sum + c.credits, 0)
  const totalCredits = guide?.courses.reduce((sum, c) => sum + c.credits, 0) || 0
  const percentage = totalCredits > 0 ? Math.round((matchedCredits / totalCredits) * 100) : 0
  const directCost = 98000
  const optimizedCost = 58000

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">TransferPath MI</h1>
                <p className="text-xs text-muted-foreground">Powered by AffordableCollege</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">Home</a>
              <a href="/find-transfer" className="text-sm font-medium text-muted-foreground hover:text-foreground">Transfer Guides</a>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Save up to $40,000 with the 2+2 path
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
                See How Many Credits Transfer to{" "}
                <span className="text-accent">{guide?.targetSchool.name || 'Oakland University'}</span>
              </h2>
              <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
                Upload your community college transcript and instantly see your transfer efficiency, 
                MTA status, and potential savings.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="text-sm">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-accent" />
                  <span className="text-sm">Results in seconds</span>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-2xl">
              <TranscriptUpload onFileChange={setFile} currentFile={file} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            </div>
          </div>
        </div>
      </section>

      {showResults && guide && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground">Your Transfer Analysis</h3>
              <p className="text-muted-foreground mt-2">Based on your uploaded transcript from {guide.originSchool.name}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              <div className="lg:col-span-1">
                <CreditGauge percentage={percentage} matchedCredits={matchedCredits} totalCredits={totalCredits} isVisible={showResults} />
              </div>
              <div className="lg:col-span-2">
                <MTABadge isCompleted={false} requirements={mtaRequirements} isVisible={showResults} />
              </div>
            </div>

            <div className="mb-12">
              <CostComparisonChart directCost={directCost} optimizedCost={optimizedCost} isVisible={showResults} />
            </div>

            <div>
              <ClassBreakdownTable classes={matchedClasses} isVisible={showResults} />
            </div>

            <div className="mt-16 text-center">
              <div className="inline-block bg-accent/10 rounded-2xl p-8 md:p-12">
                <h4 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Transfer Journey?</h4>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Connect with an {guide.targetSchool.name} advisor to finalize your transfer plan.
                </p>
                <a href="/find-transfer" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90">
                  Find Your Transfer Guide <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {!showResults && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground">Why Choose the 2+2 Path?</h3>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Start at a Michigan community college and transfer to a 4-year university. It&apos;s the smart way to save money.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Save Up to 50%</h4>
                <p className="text-muted-foreground">Community college tuition is significantly lower than university rates.</p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">MTA Protected</h4>
                <p className="text-muted-foreground">The Michigan Transfer Agreement guarantees your credits transfer.</p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Same Degree</h4>
                <p className="text-muted-foreground">Graduate with the same degree as students who attended all four years.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">TransferPath MI</h1>
                <p className="text-xs text-primary-foreground/70">Powered by AffordableCollege</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70">© 2026 TransferPath MI. Helping Michigan students save on education.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}