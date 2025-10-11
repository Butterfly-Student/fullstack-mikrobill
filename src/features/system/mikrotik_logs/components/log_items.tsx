import { Clock } from "lucide-react"
import { type MikrotikLog } from "../../server/mikrotik-logs"
import { Badge } from "@/components/ui/badge"

type LogItemProps = {
  log: MikrotikLog
}

export function LogItem({ log }: LogItemProps) {
  const getTopicVariant = (
    topics: string
  ): 'default' | 'destructive' | 'secondary' | 'outline' => {
    const lower = topics?.toLowerCase() || ''
    if (lower.includes('error') || lower.includes('critical'))
      return 'destructive'
    if (lower.includes('warning')) return 'secondary'
    return 'outline'
  }

  return (
    <div className='group bg-background hover:bg-muted/50 rounded-lg border p-3 transition-colors'>
      <div className='flex items-start gap-3'>
        {/* Time */}
        <div className='text-muted-foreground flex items-center gap-2 text-xs'>
          <Clock className='h-3 w-3' />
          <span className='font-mono'>{log.time}</span>
        </div>

        {/* Topics Badge */}
        {log.topics && (
          <Badge variant={getTopicVariant(log.topics)} className='shrink-0'>
            {log.topics}
          </Badge>
        )}
      </div>

      {/* Message */}
      <p className='mt-2 text-sm leading-relaxed'>{log.message}</p>
    </div>
  )
}
