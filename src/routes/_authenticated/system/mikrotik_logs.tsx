import { RouterLogs } from '@/features/system/mikrotik_logs';
import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/_authenticated/system/mikrotik_logs')({
  component: RouterLogs,
})
