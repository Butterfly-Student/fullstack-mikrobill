import { z } from 'zod';
import { db } from '@/db';
import { kas, type NewKas, type Kas } from '@/db/schema/system';
import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';
import { kasFormSchema } from '../kas/data/schema';


const updateKasValidator = kasFormSchema.partial()

const idValidator = z.string('ID required.')

type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
}


export const getAllKas = createServerFn().handler(
  async (): Promise<ApiResponse<Kas[]>> => {
    console.info('Fetching all kas entries...')

    try {
      const result = await db.select().from(kas).orderBy(desc(kas.tanggal))

      return {
        success: true,
        message: 'Kas entries fetched successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error fetching kas entries:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch kas entries'
      )
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