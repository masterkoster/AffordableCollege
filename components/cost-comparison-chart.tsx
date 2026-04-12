"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingDown, DollarSign } from "lucide-react"

interface CostComparisonChartProps {
  directCost: number
  optimizedCost: number
  isVisible: boolean
}

export function CostComparisonChart({ directCost, optimizedCost, isVisible }: CostComparisonChartProps) {
  const savings = directCost - optimizedCost
  const savingsPercentage = Math.round((savings / directCost) * 100)

  const data = [
    {
      path: "Direct 4-Year",
      cost: directCost,
      fill: "var(--color-chart-1)",
    },
    {
      path: "Your 2+2 Path",
      cost: optimizedCost,
      fill: "var(--color-chart-2)",
    },
  ]

  const chartConfig = {
    cost: {
      label: "Total Cost",
    },
    "Direct 4-Year": {
      label: "Direct 4-Year",
      color: "var(--chart-1)",
    },
    "Your 2+2 Path": {
      label: "Your 2+2 Path",
      color: "var(--chart-2)",
    },
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-card-foreground">
          Cost Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See how the 2+2 path saves you money
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
            >
              <XAxis 
                type="number" 
                hide 
                domain={[0, directCost * 1.1]} 
              />
              <YAxis 
                type="category" 
                dataKey="path" 
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{ fill: "var(--foreground)", fontSize: 14, fontWeight: 500 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar 
                dataKey="cost" 
                radius={[0, 8, 8, 0]}
                barSize={40}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="cost"
                  position="right"
                  formatter={(value: unknown) => formatCurrency(Number(value))}
                  style={{ 
                    fill: "var(--foreground)", 
                    fontWeight: 600,
                    fontSize: 14
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Total Savings</p>
                <p className="text-2xl font-bold text-accent">{formatCurrency(savings)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-accent">{savingsPercentage}%</p>
              <p className="text-sm text-muted-foreground">less than direct</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
