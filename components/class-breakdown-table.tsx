"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, AlertCircle, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClassMapping {
  ccCode: string
  ccName: string
  ouCode: string
  ouName: string
  credits: number
  status: "matched" | "partial" | "review"
}

interface ClassBreakdownTableProps {
  classes: ClassMapping[]
  isVisible: boolean
}

export function ClassBreakdownTable({ classes, isVisible }: ClassBreakdownTableProps) {
  const matchedCount = classes.filter(c => c.status === "matched").length

  const getStatusBadge = (status: ClassMapping["status"]) => {
    switch (status) {
      case "matched":
        return (
          <Badge className="bg-accent/20 text-accent border-0 font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Matched
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-chart-4/20 text-chart-4 border-0 font-medium">
            <AlertCircle className="w-3 h-3 mr-1" />
            Partial
          </Badge>
        )
      case "review":
        return (
          <Badge className="bg-muted text-muted-foreground border-0 font-medium">
            <BookOpen className="w-3 h-3 mr-1" />
            Review
          </Badge>
        )
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">
              Class Transfer Breakdown
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              See exactly how your CC classes map to Oakland University
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {matchedCount} of {classes.length} matched
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Community College
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground w-12">
                  
                </th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Oakland University
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Credits
                </th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem, index) => (
                <tr
                  key={`${classItem.ccCode}-${index}`}
                  className={cn(
                    "border-b border-border/50 transition-all duration-300 hover:bg-muted/50",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-semibold text-foreground">{classItem.ccCode}</p>
                      <p className="text-sm text-muted-foreground">{classItem.ccName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <ArrowRight className="w-5 h-5 text-accent mx-auto" />
                  </td>
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-semibold text-foreground">{classItem.ouCode}</p>
                      <p className="text-sm text-muted-foreground">{classItem.ouName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <span className="font-bold text-foreground">{classItem.credits}</span>
                  </td>
                  <td className="py-4 px-2 text-center">
                    {getStatusBadge(classItem.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
