import type React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string
  trend: string
  link?: string
  children?: React.ReactNode
}

export function MetricCard({
  title,
  value,
  trend,
  link,
  children,
}: MetricCardProps) {
  const isPositive =
    trend.startsWith('+') ||
    (!trend.startsWith('-') && Number.parseFloat(trend) >= 0)
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className='h-auto w-full gap-0.5 rounded-sm px-3 py-2 sm:w-full sm:px-4 sm:py-3'>
      <CardHeader className='m-0 gap-1 p-0 sm:gap-1.5'>
        <CardDescription className='m-0 flex items-center gap-0.5 p-0 text-[6px] font-bold sm:gap-1 sm:text-xs md:text-sm'>
          {link ? (
            <Link to={link} className='hover:underline'>
              {title}
            </Link>
          ) : (
            title
          )}
          <ChevronRight className='h-2.5 w-2.5 flex-shrink-0 sm:h-3 sm:w-3 md:h-4 md:w-4' />
        </CardDescription>
        <div className='flex shrink flex-wrap items-center gap-2 sm:gap-3'>
          <CardTitle className='text-[7px] font-semibold tabular-nums sm:text-[8px] md:text-xs lg:text-md'>
            {value}
          </CardTitle>
          <div className='flex shrink items-center gap-0.5 sm:gap-1'>
            <TrendIcon className='h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4' />
            <span className='text-[6px] whitespace-nowrap sm:text-[7px] md:text-sm flex items-center'>
              {trend}
            </span>
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardFooter className='m-0 mt-1 flex-col items-start gap-1 p-0 text-[6px] sm:mt-2 sm:gap-1.5 sm:text-xs md:text-sm font-normal'>
          {children}
        </CardFooter>
      )}
    </Card>
  )
}
