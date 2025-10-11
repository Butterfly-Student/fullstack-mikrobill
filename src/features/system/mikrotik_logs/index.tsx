import { useState } from 'react'
import {
  FileText,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouterLogs } from './hooks/use-logs'
import { LogItem } from './components/log_items'

// Log topics yang umum di MikroTik
const LOG_TOPICS = [
  { value: 'system', label: 'System' },
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'critical', label: 'Critical' },
  { value: 'dhcp', label: 'DHCP' },
  { value: 'firewall', label: 'Firewall' },
  { value: 'interface', label: 'Interface' },
  { value: 'ppp', label: 'PPP' },
  { value: 'hotspot', label: 'Hotspot' },
]

const LOG_LIMITS = [
  { value: '50', label: '50 logs' },
  { value: '100', label: '100 logs' },
  { value: '200', label: '200 logs' },
  { value: '500', label: '500 logs' },
]

export function RouterLogs() {
  const [topic, setTopic] = useState('')
  const [limit, setLimit] = useState(100)
  const [searchQuery, setSearchQuery] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const { logs, total, isLoading, isFetching, refetch } = useRouterLogs({
    topic,
    limit,
    refetchInterval: autoRefresh ? 5000 : false,
  })
  console.log(logs)

  // Filter logs berdasarkan search query
  const filteredLogs = logs.filter(
    (log) =>
      log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.topics?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get topic badge variant
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
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Router Logs</h2>
          <p className='text-muted-foreground'>
            Real-time logs from your MikroTik router
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'border-primary text-primary' : ''}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`}
            />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search logs...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {/* Topic Filter */}
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className='w-full sm:w-[180px]'>
                <Filter className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Filter by topic' />
              </SelectTrigger>
              <SelectContent>
                {LOG_TOPICS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Limit */}
            <Select
              value={limit.toString()}
              onValueChange={(v) => setLimit(Number(v))}
            >
              <SelectTrigger className='w-full sm:w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOG_LIMITS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Logs</CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Filtered</CardTitle>
            <Search className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{filteredLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Active Topic</CardTitle>
            <Filter className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{topic || 'All'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Logs
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {total} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className='bg-muted/30 h-[600px] rounded-lg border'>
            {isLoading ? (
              <div className='space-y-2 p-4'>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className='h-20 w-full' />
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className='flex h-[400px] items-center justify-center'>
                <div className='text-center'>
                  <AlertCircle className='text-muted-foreground/50 mx-auto h-12 w-12' />
                  <h3 className='mt-4 text-lg font-semibold'>No logs found</h3>
                  <p className='text-muted-foreground mt-2 text-sm'>
                    Try adjusting your filters or search query
                  </p>
                </div>
              </div>
            ) : (
              <div className='space-y-2 p-4'>
                {filteredLogs.map((log, idx) => (
                  <LogItem key={log['.id'] || idx} log={log} />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
