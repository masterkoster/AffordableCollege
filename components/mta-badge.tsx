"use client"

import { CheckCircle2, AlertCircle, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MTARequirement {
  name: string
  completed: boolean
  credits: string
}

interface MTABadgeProps {
  isCompleted: boolean
  requirements: MTARequirement[]
  isVisible: boolean
}

export function MTABadge({ isCompleted, requirements, isVisible }: MTABadgeProps) {
  const completedCount = requirements.filter(r => r.completed).length

  return (
    <Card className={cn(
      "border-0 shadow-lg transition-all duration-500",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      isCompleted ? "bg-accent/10 border-accent/30" : "bg-card"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">
            Michigan Transfer Agreement
          </CardTitle>
          <Badge 
            variant={isCompleted ? "default" : "secondary"}
            className={cn(
              "text-sm font-semibold px-3 py-1",
              isCompleted 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {isCompleted ? "SATISFIED" : "IN PROGRESS"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Complete these requirements to maximize transfer credits
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requirements.map((req, index) => (
            <div
              key={req.name}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
                req.completed ? "bg-accent/10" : "bg-muted/50"
              )}
              style={{ 
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-10px)"
              }}
            >
              <div className="flex items-center gap-3">
                {req.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={cn(
                  "font-medium",
                  req.completed ? "text-foreground" : "text-muted-foreground"
                )}>
                  {req.name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{req.credits}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">
              {completedCount} of {requirements.length} complete
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(completedCount / requirements.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
