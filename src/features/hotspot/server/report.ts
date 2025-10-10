import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';

const reportQuerySchema = z.object({
  routerId: z.number().min(1, 'Router ID is required'),
  date: z.string().min(1, 'Date is required'),
  useCache: z.boolean().default(true),
});

/**
 * Server function untuk mengambil report by date dari MikroTik system script
 */
export const getReportByDate = createServerFn()
  .validator((data) => reportQuerySchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { routerId, date, useCache } = data;

      const hotspot = await createMikrotikHotspot(routerId);
      const report = await hotspot.getReportByDate(date, useCache);

      return {
        success: true,
        data: report,
        date,
        useCache,
      };
    } catch (error) {
      console.error('Error getting report by date:', error);
      throw new Error('Failed to get report by date');
    }
  });

/**
 * Server function untuk mengambil count report by date
 */
export const getReportCount = createServerFn()
  .validator((data) => {
    return z.object({
      routerId: z.number().min(1, 'Router ID is required'),
      date: z.string().min(1, 'Date is required'),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    try {
      const { routerId, date } = data;

      const hotspot = await createMikrotikHotspot(routerId);
      const count = await hotspot.getReportCount(date);

      return {
        success: true,
        count,
        date,
      };
    } catch (error) {
      console.error('Error getting report count:', error);
      throw new Error('Failed to get report count');
    }
  });