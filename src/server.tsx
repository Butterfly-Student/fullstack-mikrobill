import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createRouter } from './router'
import { startCronJobs } from '@/cron/tagihan';

startCronJobs()

const Server = createStartHandler({
  createRouter,
})(defaultStreamHandler)

export default Server;