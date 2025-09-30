import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Link } from "@tanstack/react-router"

interface MetricCardProps {
  title: string
  value: string
  trend: string
  link?: string
  children?: React.ReactNode
}

export function MetricCard({ title, value, trend, link, children }: MetricCardProps) {
  const isPositive = trend.startsWith("+") || (!trend.startsWith("-") && Number.parseFloat(trend) >= 0)
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className="w-4 h-14 sm:w-full sm:h-auto rounded-xs py-0.5 px-0.5 gap-0.5">
      <CardHeader className="p-0 m-0 gap-0.5">
        <CardDescription className="text-[8px] font-bold p-0 m-0">
          {link ? (
            <Link to={link} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </CardDescription>
        <div className="flex shrink items-center gap-2">
        <CardTitle className="text-[7px] font-semibold tabular-nums sm:text-2xl @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <div className="flex shrink items-center">
          <TrendIcon className="w-3 h-3" />
          <span className="text-[7px] font-bold">
          {trend}
          </span>
        </div>
        </div>
      </CardHeader>
      {children && 
      <CardFooter className="p-0 m-0 flex-col items-start gap-1.5 text-[7px] font-semibold">
        {
          children
        }
      </CardFooter>}
    </Card>
  )
}