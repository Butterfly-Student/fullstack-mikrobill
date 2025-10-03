import { useEffect, useState } from 'react'
import { IRosOptions } from 'routeros-api'
import { cn } from '@/lib/utils'
import { useMikrotikStream } from '@/hooks/use-mikrotil-stream'
import { useRouterManagement } from '@/hooks/use-router'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const { activeRouter } = useRouterManagement()

  // Ping monitor configuration
  const config: IRosOptions = {
    host: activeRouter?.hostname ?? '',
    user: activeRouter?.username,
    password: activeRouter?.password,
    port: activeRouter?.port || 8728,
    timeout: activeRouter?.timeout || 10000,
    keepalive: activeRouter?.keepalive ?? true,
  }

  const { latestData, isSubscribed } = useMikrotikStream(
    '/ping',
    config,
    ['=address=8.8.8.8'],
    {
      autoSubscribe: true,
    }
  )

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  // Extract ping time from latestData and parse only ms part
  const rawPingTime = latestData?.time || latestData?.['time'] || null

  // Extract only ms part from format like "23ms785us"
  const extractMs = (time: string | null): string | null => {
    if (!time) return null
    const match = time.match(/(\d+)ms/)
    return match ? `${match[1]}ms` : null
  }

  const pingTime = extractMs(rawPingTime)
  const pingStatus = latestData
    ? 'timeout' in latestData || latestData?.['timeout']
      ? 'timeout'
      : 'ok'
    : 'waiting'

  // Get ping status color and indicator
  const getPingStyle = () => {
    if (!isSubscribed || !activeRouter) {
      return {
        color: 'text-muted-foreground',
        bg: 'bg-muted-foreground/20',
        indicator: 'bg-muted-foreground',
      }
    }

    if (pingStatus === 'timeout') {
      return {
        color: 'text-destructive',
        bg: 'bg-destructive/20',
        indicator: 'bg-destructive',
      }
    }

    if (pingStatus === 'waiting' || !pingTime) {
      return {
        color: 'text-yellow-600 dark:text-yellow-500',
        bg: 'bg-yellow-500/20',
        indicator: 'bg-yellow-500',
      }
    }

    // Parse ping time to determine quality
    const timeMs = parseInt(pingTime.replace('ms', ''))
    if (timeMs < 50) {
      return {
        color: 'text-green-600 dark:text-green-500',
        bg: 'bg-green-500/20',
        indicator: 'bg-green-500',
        text: pingTime,
      }
    } else if (timeMs < 100) {
      return {
        color: 'text-blue-600 dark:text-blue-500',
        bg: 'bg-blue-500/20',
        indicator: 'bg-blue-500',
        text: pingTime,
      }
    } else if (timeMs < 200) {
      return {
        color: 'text-yellow-600 dark:text-yellow-500',
        bg: 'bg-yellow-500/20',
        indicator: 'bg-yellow-500',
        text: pingTime,
      }
    } else {
      return {
        color: 'text-orange-600 dark:text-orange-500',
        bg: 'bg-orange-500/20',
        indicator: 'bg-orange-500',
        text: pingTime,
      }
    }
  }

  const pingStyle = getPingStyle()

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        <Separator orientation='vertical' className='h-4' />
        <div
          className={cn(
            'flex items-center gap-0.5 rounded-md px-1 py-0 text-[12px] font-medium transition-colors',
            pingStyle.bg
          )}
        >
          <span
            className={cn(
              'h-1 w-1 animate-pulse rounded-full',
              pingStyle.indicator
            )}
          />
          <span className={cn('font-mono', pingStyle.color)}>
            {pingStyle.text}
          </span>
        </div>
        {children}
      </div>
    </header>
  )
}
