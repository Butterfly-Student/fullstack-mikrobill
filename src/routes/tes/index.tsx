import { createFileRoute } from '@tanstack/react-router';
import MikrotikPage from '@/features/mikrotik-monitor';


export const Route = createFileRoute('/tes/')({
  component: MikrotikPage,
})