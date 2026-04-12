"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CreditGaugeProps {
  percentage: number
  matchedCredits: number
  totalCredits: number
  isVisible: boolean
}

export function CreditGauge({ percentage, matchedCredits, totalCredits, isVisible }: CreditGaugeProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedPercentage(percentage)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [percentage, isVisible])

  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  const getStatusColor = (pct: number) => {
    if (pct >= 80) return "text-accent"
    if (pct >= 60) return "text-chart-4"
    return "text-destructive"
  }

  const getStatusText = (pct: number) => {
    if (pct >= 80) return "Excellent Match!"
    if (pct >= 60) return "Good Progress"
    return "Needs Review"
  }

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-center text-card-foreground">
          Transfer Efficiency Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className={cn("transition-all duration-1000 ease-out", getStatusColor(animatedPercentage))}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-6xl font-bold transition-colors duration-500", getStatusColor(animatedPercentage))}>
              {Math.round(animatedPercentage)}%
            </span>
            <span className="text-sm text-muted-foreground mt-1">Credit Match</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className={cn("text-lg font-semibold", getStatusColor(animatedPercentage))}>
            {getStatusText(animatedPercentage)}
          </p>
          <p className="text-muted-foreground mt-1">
            <span className="font-bold text-foreground">{matchedCredits}</span> of{" "}
            <span className="font-bold text-foreground">{totalCredits}</span> credits transfer to Oakland University
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
