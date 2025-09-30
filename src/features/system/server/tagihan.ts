import { z } from 'zod'
import { db } from '@/db'
import {
  pelanggan,
  type Tagihan,
  tagihan,
  templateTagihan,
} from '@/db/schema/system'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq, like, sql, inArray } from 'drizzle-orm'
import { type TagihanForm, tagihanFormSchema } from '../tagihan/data/schema'

const updateTagihanValidator = tagihanFormSchema.partial()

const idValidator = z.string().uuid('Invalid ID format')

// Validator untuk multiple IDs
const multipleIdsValidator = z
  .array(z.string().uuid('Invalid ID format'))
  .min(1, 'At least one ID is required')

type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
}

export const getAllTagihan = createServerFn().handler(
  async (): Promise<ApiResponse<any[]>> => {
    console.info('Fetching all tagihan with pelanggan info...')

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
        .orderBy(desc(tagihan.createdAt))

      return {
        success: true,
        message: 'Tagihan fetched successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error fetching tagihan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch tagihan'
      )
    }
  }
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
  .validator((id: string) => idValidator.parse(id))
  .handler(async ({ data: id }): Promise<ApiResponse<boolean>> => {
    console.info(`Deleting tagihan with ID: ${id}`)

    try {
      const result = await db.delete(tagihan).where(eq(tagihan.id, id))

      if (result.count === 0) {
        throw new Error('Tagihan not found')
      }

      return {
        success: true,
        message: 'Tagihan deleted successfully',
        data: true,
      }
    } catch (error) {
      console.error('Error deleting tagihan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete tagihan'
      )
    }
  })

// NEW: Multi-delete function
export const deleteMultipleTagihan = createServerFn()
  .validator((ids: string[]) => multipleIdsValidator.parse(ids))
  .handler(
    async ({
      data: ids,
    }): Promise<ApiResponse<{ deletedCount: number; failedIds: string[] }>> => {
      console.info(`Deleting multiple tagihan with IDs: ${ids.join(', ')}`)

      try {
        // First, check which IDs exist
        const existingTagihan = await db
          .select({ id: tagihan.id })
          .from(tagihan)
          .where(inArray(tagihan.id, ids))

        const existingIds = existingTagihan.map((t) => t.id)
        const failedIds = ids.filter((id) => !existingIds.includes(id))

        if (existingIds.length === 0) {
          return {
            success: false,
            message: 'No valid tagihan found to delete',
            data: { deletedCount: 0, failedIds: ids },
          }
        }

        // Delete existing tagihan
        const result = await db
          .delete(tagihan)
          .where(inArray(tagihan.id, existingIds))

        const deletedCount = result.count || 0

        return {
          success: true,
          message: `${deletedCount} tagihan deleted successfully${failedIds.length > 0 ? `, ${failedIds.length} failed` : ''}`,
          data: {
            deletedCount,
            failedIds,
          },
        }
      } catch (error) {
        console.error('Error deleting multiple tagihan:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to delete multiple tagihan'
        )
      }
    }
  )

export const updateTagihanStatus = createServerFn()
  .validator(
    (input: { id: string; status: 'belum_lunas' | 'lunas' | 'sebagian' }) => ({
      id: idValidator.parse(input.id),
      status: z.enum(['belum_lunas', 'lunas', 'sebagian']).parse(input.status),
    })
  )
  .handler(async ({ data: { id, status } }): Promise<ApiResponse<Tagihan>> => {
    console.info(`Updating tagihan status with ID: ${id} to ${status}`)

    try {
      const result = await db
        .update(tagihan)
        .set({ status })
        .where(eq(tagihan.id, id))
        .returning()

      if (result.length === 0) {
        throw new Error('Tagihan not found')
      }

      return {
        success: true,
        message: 'Tagihan status updated successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error updating tagihan status:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to update tagihan status'
      )
    }
  })

// NEW: Multi-update status function
export const updateMultipleTagihanStatus = createServerFn()
  .validator(
    (input: {
      ids: string[]
      status: 'belum_lunas' | 'lunas' | 'sebagian'
    }) => ({
      ids: multipleIdsValidator.parse(input.ids),
      status: z.enum(['belum_lunas', 'lunas', 'sebagian']).parse(input.status),
    })
  )
  .handler(
    async ({
      data: { ids, status },
    }): Promise<ApiResponse<{ updatedCount: number; failedIds: string[] }>> => {
      console.info(
        `Updating multiple tagihan status with IDs: ${ids.join(', ')} to ${status}`
      )

      try {
        // First, check which IDs exist
        const existingTagihan = await db
          .select({ id: tagihan.id })
          .from(tagihan)
          .where(inArray(tagihan.id, ids))

        const existingIds = existingTagihan.map((t) => t.id)
        const failedIds = ids.filter((id) => !existingIds.includes(id))

        if (existingIds.length === 0) {
          return {
            success: false,
            message: 'No valid tagihan found to update',
            data: { updatedCount: 0, failedIds: ids },
          }
        }

        // Update existing tagihan
        const result = await db
          .update(tagihan)
          .set({ status })
          .where(inArray(tagihan.id, existingIds))

        const updatedCount = result.count || 0

        return {
          success: true,
          message: `${updatedCount} tagihan status updated successfully${failedIds.length > 0 ? `, ${failedIds.length} failed` : ''}`,
          data: {
            updatedCount,
            failedIds,
          },
        }
      } catch (error) {
        console.error('Error updating multiple tagihan status:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to update multiple tagihan status'
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
