import { z } from 'zod';
import { db } from '@/db';
import { pelanggan, type Tagihan, tagihan, templateTagihan } from '@/db/schema/system';
import { createServerFn } from '@tanstack/react-start';
import { desc, eq, and, gte, lt, sql, inArray, like } from 'drizzle-orm';
import { type TagihanForm, tagihanFormSchema } from '../tagihan/data/schema';


const updateTagihanValidator = tagihanFormSchema.partial()

const idValidator = z.uuid('Invalid ID format')

const deleteTagihanValidator = z.union([z.string(), z.array(z.string())])

const updateTagihanStatusValidator = z.object({
  id: z.union([z.string(), z.array(z.string())]),
  status: z.enum(['belum_lunas', 'lunas', 'sebagian', 'jatuh_tempo']),
})

type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
  summary?: T
}

// ✅ Fixed: Handle zero properly
function calculateGrowth(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

// ✅ Extract reusable query function
async function getSummaryForPeriod(startDate: Date, endDate: Date) {
  // Convert Date to ISO string for PgDateString comparison
  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]
  
  return await db
    .select({
      status: tagihan.status,
      total: sql<string>`COALESCE(SUM(${tagihan.total}), 0)`.as('total'),
      count: sql<string>`COALESCE(COUNT(${tagihan.id}), 0)`.as('count'),
      uniqueCustomers: sql<string>`COALESCE(COUNT(DISTINCT ${tagihan.pelangganId}), 0)`.as('unique_customers'),
    })
    .from(tagihan)
    .where(and(gte(tagihan.tanggal, startStr), lt(tagihan.tanggal, endStr)))
    .groupBy(tagihan.status)
}

type StatusType = 'belum_lunas' | 'lunas' | 'sebagian' | 'jatuh_tempo' | null

function mapSummary(data: Array<{ status: StatusType; total: string; count: string; uniqueCustomers: string }>) {
  const totalCount = data.reduce((acc, d) => acc + Number(d.count), 0)
  const totalNominal = data.reduce((acc, d) => acc + Number(d.total), 0)

  const lunas = data.find((d) => d.status === 'lunas')
  const belum = data.find((d) => d.status === 'belum_lunas')

  return {
    total: {
      jumlahTagihan: totalCount,
      nominal: totalNominal,
    },
    lunas: {
      jumlahTagihan: Number(lunas?.count ?? 0),
      nominal: Number(lunas?.total ?? 0),
      jumlahOrang: Number(lunas?.uniqueCustomers ?? 0),
    },
    belumLunas: {
      jumlahTagihan: Number(belum?.count ?? 0),
      nominal: Number(belum?.total ?? 0),
      jumlahOrang: Number(belum?.uniqueCustomers ?? 0),
    },
  }
}

export const getAllTagihan = createServerFn().handler(
  async (): Promise<ApiResponse<any>> => {
    console.info('Fetching all tagihan with pelanggan info & summary...')

    try {
      // Date ranges
      const now = new Date()
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      // ✅ Parallel queries for better performance
      const [result, thisMonth, lastMonth] = await Promise.all([
        // Detail data with JOIN
        db
          .select({
            id: tagihan.id,
            noTagihan: tagihan.noTagihan,
            tanggal: tagihan.tanggal,
            jatuhTempo: tagihan.jatuhTempo,
            deskripsi: tagihan.deskripsi,
            status: tagihan.status,
            total: tagihan.total,
            pelangganId: tagihan.pelangganId,
            templateId: tagihan.templateId,
            createdAt: tagihan.createdAt,
            pelangganName: pelanggan.name,
            pelangganEmail: pelanggan.email,
          })
          .from(tagihan)
          .leftJoin(pelanggan, eq(tagihan.pelangganId, pelanggan.id))
          .orderBy(desc(tagihan.createdAt)),

        // This month summary
        getSummaryForPeriod(startOfThisMonth, startOfNextMonth),

        // Last month summary
        getSummaryForPeriod(startOfLastMonth, startOfThisMonth),
      ])

      // Map summaries
      const current = mapSummary(thisMonth)
      const previous = mapSummary(lastMonth)

      // Calculate growth
      const growth = {
        total: {
          jumlahTagihan: calculateGrowth(
            current.total.jumlahTagihan,
            previous.total.jumlahTagihan,
          ),
          nominal: calculateGrowth(
            current.total.nominal,
            previous.total.nominal,
          ),
        },
        lunas: {
          jumlahTagihan: calculateGrowth(
            current.lunas.jumlahTagihan,
            previous.lunas.jumlahTagihan,
          ),
          nominal: calculateGrowth(current.lunas.nominal, previous.lunas.nominal),
          jumlahOrang: calculateGrowth(
            current.lunas.jumlahOrang,
            previous.lunas.jumlahOrang,
          ),
        },
        belumLunas: {
          jumlahTagihan: calculateGrowth(
            current.belumLunas.jumlahTagihan,
            previous.belumLunas.jumlahTagihan,
          ),
          nominal: calculateGrowth(
            current.belumLunas.nominal,
            previous.belumLunas.nominal,
          ),
          jumlahOrang: calculateGrowth(
            current.belumLunas.jumlahOrang,
            previous.belumLunas.jumlahOrang,
          ),
        },
      }

      return {
        success: true,
        message: 'Tagihan fetched successfully',
        data: result,
        summary: {
          current,
          previous,
          growth,
        },
      }
    } catch (error) {
      console.error('Error fetching tagihan:', error)
      
      // ✅ Fixed: Return ApiResponse instead of throwing
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tagihan',
        data: [],
        summary: {
          current: {
            total: { jumlahTagihan: 0, nominal: 0 },
            lunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
            belumLunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
          },
          previous: {
            total: { jumlahTagihan: 0, nominal: 0 },
            lunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
            belumLunas: { jumlahTagihan: 0, nominal: 0, jumlahOrang: 0 },
          },
          growth: {
            total: { jumlahTagihan: null, nominal: null },
            lunas: { jumlahTagihan: null, nominal: null, jumlahOrang: null },
            belumLunas: { jumlahTagihan: null, nominal: null, jumlahOrang: null },
          },
        },
      }
    }
  },
)

export const getTagihanById = createServerFn()
  .validator((id: string) => idValidator.parse(id))
  .handler(async ({ data: id }): Promise<ApiResponse<any | null>> => {
    console.info(`Fetching tagihan with ID: ${id}`)

    try {
      const result = await db
        .select({
          id: tagihan.id,
          noTagihan: tagihan.noTagihan,
          tanggal: tagihan.tanggal,
          jatuhTempo: tagihan.jatuhTempo,
          deskripsi: tagihan.deskripsi,
          status: tagihan.status,
          total: tagihan.total,
          pelangganId: tagihan.pelangganId,
          templateId: tagihan.templateId,
          createdAt: tagihan.createdAt,
          pelangganName: pelanggan.name,
          pelangganEmail: pelanggan.email,
        })
        .from(tagihan)
        .leftJoin(pelanggan, eq(tagihan.pelangganId, pelanggan.id))
        .where(eq(tagihan.id, id))
        .limit(1)

      return {
        success: true,
        message: result[0] ? 'Tagihan found' : 'Tagihan not found',
        data: result[0] || null,
      }
    } catch (error) {
      console.error('Error fetching tagihan by ID:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch tagihan'
      )
    }
  })

export const getTagihanByPelangganId = createServerFn()
  .validator((pelangganId: string) => idValidator.parse(pelangganId))
  .handler(async ({ data: pelangganId }): Promise<ApiResponse<Tagihan[]>> => {
    console.info(`Fetching tagihan for pelanggan ID: ${pelangganId}`)

    try {
      const result = await db
        .select()
        .from(tagihan)
        .where(eq(tagihan.pelangganId, pelangganId))
        .orderBy(desc(tagihan.createdAt))

      return {
        success: true,
        message: 'Tagihan fetched successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error fetching tagihan by pelanggan ID:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch tagihan'
      )
    }
  })

export const createTagihan = createServerFn()
  .validator((data) => tagihanFormSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<Tagihan>> => {
    console.info('Creating new tagihan...')

    try {
      // Check if pelanggan exists
      const pelangganExists = await db
        .select()
        .from(pelanggan)
        .where(eq(pelanggan.id, data.pelangganId))
        .limit(1)
      if (pelangganExists.length === 0) {
        throw new Error('Pelanggan not found')
      }

      // Check if template exists if templateId is provided
      if (data.templateId) {
        const templateExists = await db
          .select()
          .from(templateTagihan)
          .where(eq(templateTagihan.id, data.templateId))
          .limit(1)
        if (templateExists.length === 0) {
          throw new Error('Template tagihan not found')
        }
      }

      // Check if noTagihan is unique
      const existingTagihan = await db
        .select()
        .from(tagihan)
        .where(eq(tagihan.noTagihan, data.noTagihan))
        .limit(1)
      if (existingTagihan.length > 0) {
        throw new Error('Invoice number already exists')
      }

      const parseData = {
        ...data,
        createdAt: new Date(),
      }

      const result = await db.insert(tagihan).values(parseData).returning()

      return {
        success: true,
        message: 'Tagihan created successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error creating tagihan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create tagihan'
      )
    }
  })

export const updateTagihan = createServerFn()
  .validator((input: { id: string; data: Partial<TagihanForm> }) => ({
    id: idValidator.parse(input.id),
    data: updateTagihanValidator.parse(input.data),
  }))
  .handler(async ({ data: { id, data } }): Promise<ApiResponse<Tagihan>> => {
    console.info(`Updating tagihan with ID: ${id}`)

    try {
      // Check if pelanggan exists if pelangganId is being updated
      if (data.pelangganId) {
        const pelangganExists = await db
          .select()
          .from(pelanggan)
          .where(eq(pelanggan.id, data.pelangganId))
          .limit(1)
        if (pelangganExists.length === 0) {
          throw new Error('Pelanggan not found')
        }
      }

      // Check if template exists if templateId is being updated
      if (data.templateId) {
        const templateExists = await db
          .select()
          .from(templateTagihan)
          .where(eq(templateTagihan.id, data.templateId))
          .limit(1)
        if (templateExists.length === 0) {
          throw new Error('Template tagihan not found')
        }
      }

      // Check if noTagihan is unique if being updated
      if (data.noTagihan) {
        const existingTagihan = await db
          .select()
          .from(tagihan)
          .where(eq(tagihan.noTagihan, data.noTagihan))
          .limit(1)
        if (existingTagihan.length > 0 && existingTagihan[0].id !== id) {
          throw new Error('Invoice number already exists')
        }
      }

      const parseData = {
        ...data,
        createdAt: new Date(),
      }

      const result = await db
        .update(tagihan)
        .set(parseData)
        .where(eq(tagihan.id, id))
        .returning()

      if (result.length === 0) {
        throw new Error('Tagihan not found')
      }

      return {
        success: true,
        message: 'Tagihan updated successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error updating tagihan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update tagihan'
      )
    }
  })

export const deleteTagihan = createServerFn()
  .validator((data: string | string[]) => deleteTagihanValidator.parse(data))
  .handler(
    async ({
      data,
    }): Promise<ApiResponse<boolean | { deletedCount: number; failedIds: string[] }>> => {
      const ids = Array.isArray(data) ? data : [data]
      const isSingle = !Array.isArray(data)

      console.info(
        `Deleting tagihan with ID${ids.length > 1 ? 's' : ''}: ${ids.join(', ')}`
      )

      try {
        // Check which IDs exist
        const existingTagihan = await db
          .select({ id: tagihan.id })
          .from(tagihan)
          .where(ids.length === 1 ? eq(tagihan.id, ids[0]) : inArray(tagihan.id, ids))

        const existingIds = existingTagihan.map((t) => t.id)
        const failedIds = ids.filter((id) => !existingIds.includes(id))

        if (existingIds.length === 0) {
          throw new Error(
            isSingle ? 'Tagihan not found' : 'No valid tagihan found to delete'
          )
        }

        // Delete existing tagihan
        const result = await db
          .delete(tagihan)
          .where(
            existingIds.length === 1
              ? eq(tagihan.id, existingIds[0])
              : inArray(tagihan.id, existingIds)
          )

        const deletedCount = result.count || 0

        // Return format based on input type
        if (isSingle) {
          return {
            success: true,
            message: 'Tagihan deleted successfully',
            data: true,
          }
        }

        return {
          success: true,
          message: `${deletedCount} tagihan deleted successfully${failedIds.length > 0 ? `, ${failedIds.length} failed` : ''}`,
          data: {
            deletedCount,
            failedIds,
          },
        }
      } catch (error) {
        console.error('Error deleting tagihan:', error)
        throw new Error(
          error instanceof Error ? error.message : 'Failed to delete tagihan'
        )
      }
    }
  )


export const updateTagihanStatus = createServerFn()
  .validator((input: {
    id: string | string[]
    status: 'belum_lunas' | 'lunas' | 'sebagian' | 'jatuh_tempo'
  }) => updateTagihanStatusValidator.parse(input))
  .handler(
    async ({
      data: { id, status },
    }): Promise<ApiResponse<Tagihan | { updatedCount: number; failedIds: string[] }>> => {
      const ids = Array.isArray(id) ? id : [id]
      const isSingle = !Array.isArray(id)

      console.info(
        `Updating tagihan status with ID${ids.length > 1 ? 's' : ''}: ${ids.join(', ')} to ${status}`
      )

      try {
        // Check which IDs exist
        const existingTagihan = await db
          .select({ id: tagihan.id })
          .from(tagihan)
          .where(ids.length === 1 ? eq(tagihan.id, ids[0]) : inArray(tagihan.id, ids))

        const existingIds = existingTagihan.map((t) => t.id)
        const failedIds = ids.filter((id) => !existingIds.includes(id))

        if (existingIds.length === 0) {
          throw new Error(
            isSingle ? 'Tagihan not found' : 'No valid tagihan found to update'
          )
        }

        // Update existing tagihan
        const result = await db
          .update(tagihan)
          .set({ status })
          .where(
            existingIds.length === 1
              ? eq(tagihan.id, existingIds[0])
              : inArray(tagihan.id, existingIds)
          )
          .returning()

        const updatedCount = result.length

        // Return format based on input type
        if (isSingle) {
          return {
            success: true,
            message: 'Tagihan status updated successfully',
            data: result[0],
          }
        }

        return {
          success: true,
          message: `${updatedCount} tagihan status updated successfully${failedIds.length > 0 ? `, ${failedIds.length} failed` : ''}`,
          data: {
            updatedCount,
            failedIds,
          },
        }
      } catch (error) {
        console.error('Error updating tagihan status:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to update tagihan status'
        )
      }
    }
  )

// ======================
// UTILITY FUNCTIONS
// ======================

export const generateNoTagihan = createServerFn().handler(
  async (): Promise<ApiResponse<string>> => {
    console.info('Generating new tagihan number...')

    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')

      // Get count of tagihan this month
      const monthPrefix = `INV${year}${month}`
      const existingTagihan = await db
        .select()
        .from(tagihan)
        .where(like(tagihan.noTagihan, `${monthPrefix}%`))

      const sequence = String(existingTagihan.length + 1).padStart(4, '0')
      const newNoTagihan = `${monthPrefix}${sequence}`

      return {
        success: true,
        message: 'Invoice number generated successfully',
        data: newNoTagihan,
      }
    } catch (error) {
      console.error('Error generating tagihan number:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to generate tagihan number'
      )
    }
  }
)

export const getDashboardStats = createServerFn().handler(
  async (): Promise<ApiResponse<any>> => {
    console.info('Fetching dashboard statistics...')

    try {
      const [
        totalPelangganResult,
        totalTagihanResult,
        tagihanLunasResult,
        tagihanBelumLunasResult,
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(pelanggan),
        db.select({ count: sql<number>`count(*)` }).from(tagihan),
        db
          .select({ count: sql<number>`count(*)` })
          .from(tagihan)
          .where(eq(tagihan.status, 'lunas')),
        db
          .select({ count: sql<number>`count(*)` })
          .from(tagihan)
          .where(eq(tagihan.status, 'belum_lunas')),
      ])

      const stats = {
        totalPelanggan: totalPelangganResult[0]?.count || 0,
        totalTagihan: totalTagihanResult[0]?.count || 0,
        tagihanLunas: tagihanLunasResult[0]?.count || 0,
        tagihanBelumLunas: tagihanBelumLunasResult[0]?.count || 0,
      }

      return {
        success: true,
        message: 'Dashboard statistics fetched successfully',
        data: stats,
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch dashboard statistics'
      )
    }
  }
)