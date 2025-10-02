import { z } from 'zod';
import { db } from '@/db';
import { kas, type NewKas, type Kas } from '@/db/schema/system';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { kasFormSchema } from '../kas/data/schema';


const updateKasValidator = kasFormSchema.partial()

const idValidator = z.string('ID required.')

type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
  summary?: T
}

// Helper: Calculate growth percentage safely
const calculateGrowth = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

// Helper: Get summary for a date range using SQL aggregation
const getSummaryForPeriod = async (startDate: Date, endDate: Date) => {
  const result = await db
    .select({
      masuk: sql<string>`COALESCE(SUM(CASE WHEN ${kas.jenis} = 'masuk' THEN ${kas.jumlah} ELSE 0 END), 0)`,
      keluar: sql<string>`COALESCE(SUM(CASE WHEN ${kas.jenis} = 'keluar' THEN ${kas.jumlah} ELSE 0 END), 0)`,
    })
    .from(kas)
    .where(and(gte(kas.tanggal, startDate), lt(kas.tanggal, endDate)))

  const masuk = Number(result[0]?.masuk ?? 0)
  const keluar = Number(result[0]?.keluar ?? 0)

  return {
    masuk,
    keluar,
    saldo: masuk - keluar,
  }
}



export const getAllKas = createServerFn().handler(
  async (): Promise<ApiResponse<{ data: Kas[]; summary: any }>> => {
    console.info('Fetching kas entries for this month...')
    
    try {
      const now = new Date()
      
      // Current month range
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      
      // Previous month range
      const prevFirstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevNextMonth = firstDay

      // Fetch current month data
      const result = await db
        .select()
        .from(kas)
        .where(and(gte(kas.tanggal, firstDay), lt(kas.tanggal, nextMonth)))
        .orderBy(desc(kas.tanggal))

      // Get summaries using optimized SQL aggregation
      const [current, previous] = await Promise.all([
        getSummaryForPeriod(firstDay, nextMonth),
        getSummaryForPeriod(prevFirstDay, prevNextMonth),
      ])

      // Calculate growth percentages
      const growth = {
        masuk: calculateGrowth(current.masuk, previous.masuk),
        keluar: calculateGrowth(current.keluar, previous.keluar),
        saldo: calculateGrowth(current.saldo, previous.saldo),
      }

      return {
        success: true,
        message: 'Kas entries fetched successfully',
        data: result,
        summary: {
          current,
          previous,
          growth,
        },
      }
    } catch (error) {
      console.error('Error fetching kas entries:', error)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch kas entries',
        data: [],
        summary: {
          current: { masuk: 0, keluar: 0, saldo: 0 },
          previous: { masuk: 0, keluar: 0, saldo: 0 },
          growth: { masuk: null, keluar: null, saldo: null },
        },
      }
    }
  }
)

export const getKasById = createServerFn()
  .validator((id: string) => idValidator.parse(id))
  .handler(async ({ data: id }): Promise<ApiResponse<Kas | null>> => {
    console.info(`Fetching kas entry with ID: ${id}`)

    try {
      const result = await db.select().from(kas).where(eq(kas.id, id)).limit(1)

      return {
        success: true,
        message: result[0] ? 'Kas entry found' : 'Kas entry not found',
        data: result[0] || null,
      }
    } catch (error) {
      console.error('Error fetching kas entry by ID:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch kas entry'
      )
    }
  })

export const createKas = createServerFn()
  .validator((data) => kasFormSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<Kas>> => {
    console.info('Creating new kas entry...')
    console.log(data)


    try {
      const result = await db.insert(kas).values(data).returning()

      return {
        success: true,
        message: 'Kas entry created successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error creating kas entry:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create kas entry'
      )
    }
  })

export const updateKas = createServerFn()
  .validator((input: { id: string; data: Partial<NewKas> }) => ({
    id: idValidator.parse(input.id),
    data: updateKasValidator.parse(input.data),
  }))
  .handler(async ({ data: { id, data } }): Promise<ApiResponse<Kas>> => {
    console.info(`Updating kas entry with ID: ${id}`)

    try {
      const result = await db
        .update(kas)
        .set(data)
        .where(eq(kas.id, id))
        .returning()

      if (result.length === 0) {
        throw new Error('Kas entry not found')
      }

      return {
        success: true,
        message: 'Kas entry updated successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error updating kas entry:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update kas entry'
      )
    }
  })

export const deleteKas = createServerFn()
  .validator((id: string) => idValidator.parse(id))
  .handler(async ({ data: id }): Promise<ApiResponse<boolean>> => {
    console.info(`Deleting kas entry with ID: ${id}`)

    try {
      const result = await db.delete(kas).where(eq(kas.id, id))

      if (result.count === 0) {
        throw new Error('Kas entry not found')
      }

      return {
        success: true,
        message: 'Kas entry deleted successfully',
        data: true,
      }
    } catch (error) {
      console.error('Error deleting kas entry:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete kas entry'
      )
    }
  })