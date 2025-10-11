import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';


// ✅ Validator input data dari client
export const routerLogValidator = z.object({
  routerId: z.number(),
  topic: z.string().optional(), // opsional: filter log berdasarkan topik
  limit: z.number().optional(), // default ambil 100 log terakhir
})

// ✅ Tipe hasil log dari RouterOS
export type MikrotikLog = {
  '.id': string
  time: string
  topics: string
  message: string
}

// ✅ Fungsi utama TanStack Start ServerFn
export const getRouterLogs = createServerFn()
  .validator((data) => routerLogValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik logs...')

    try {
      const { routerId, topic, limit } = data

      // 🔧 buat koneksi ke MikroTik
      const hotspot = await createMikrotikHotspot(routerId)

      // 📡 ambil data log dari RouterOS
     const logs = await hotspot.exec<MikrotikLog[]>('/log/print', [
       '=.proplist=time,topics,message',
     ])
      // 🧹 handle data kosong atau undefined
      const cleanLogs = Array.isArray(logs) ? logs : []

      // 🔍 filter berdasarkan topic jika diberikan
      const filtered = topic
        ? cleanLogs.filter((l) =>
            l.topics?.toLowerCase().includes(topic.toLowerCase())
          )
        : cleanLogs

      // 🔢 batasi jumlah log
      const limited = limit
        ? filtered.slice(-limit).reverse()
        : [...filtered].reverse()

      return {
        success: true,
        data: limited,
        total: limited.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik logs:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch MikroTik logs'
      )
    }
  })