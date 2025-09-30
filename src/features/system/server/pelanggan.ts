import { z } from 'zod';
import { db } from '@/db/index';
import { type NewPelanggan, pelanggan, type Pelanggan } from '@/db/schema/system';
import { createServerFn } from '@tanstack/react-start';
import { eq, desc } from 'drizzle-orm';
import { pelangganFormSchema } from '../pelanggan/data/schema';


const updatePelangganValidator = pelangganFormSchema.partial()


const idValidator = z.string('ID required.')



type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
}

// ======================
// PELANGGAN CRUD
// ======================

export const getAllPelanggan = createServerFn()
  .handler(async (): Promise<ApiResponse<Pelanggan[]>> => {
    console.info('Fetching all pelanggan...')

    try {
      const result = await db.select().from(pelanggan).orderBy(desc(pelanggan.createdAt))

      return {
        success: true,
        message: 'Pelanggan fetched successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error fetching pelanggan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch pelanggan'
      )
    }
  })

export const getPelangganById = createServerFn()
  .validator((id: string) => idValidator.parse(id))
  .handler(async ({ data: id }): Promise<ApiResponse<Pelanggan | null>> => {
    console.info(`Fetching pelanggan with ID: ${id}`)

    try {
      const result = await db.select().from(pelanggan).where(eq(pelanggan.id, id)).limit(1)

      return {
        success: true,
        message: result[0] ? 'Pelanggan found' : 'Pelanggan not found',
        data: result[0] || null,
      }
    } catch (error) {
      console.error('Error fetching pelanggan by ID:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch pelanggan'
      )
    }
  })

export const createPelanggan = createServerFn()
  .validator((data) => pelangganFormSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<Pelanggan>> => {
    console.info('Creating new pelanggan...')

    try {
      console.log('Data', data)
      const result = await db.insert(pelanggan).values(data).returning()

      return {
        success: true,
        message: 'Pelanggan created successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error creating pelanggan:', error)

      if (error instanceof Error && error.message.includes('unique')) {
        throw new Error('Email already exists')
      }

      throw new Error(
        error instanceof Error ? error.message : 'Failed to create pelanggan'
      )
    }
  })

export const updatePelanggan = createServerFn()
  .validator((input: { id: string; data: Partial<NewPelanggan> }) => ({
    id: idValidator.parse(input.id),
    data: updatePelangganValidator.parse(input.data),
  }))
  .handler(async ({ data: { id, data } }): Promise<ApiResponse<Pelanggan>> => {
    console.info(`Updating pelanggan with ID: ${id}`)

    try {
      const result = await db.update(pelanggan).set(data).where(eq(pelanggan.id, id)).returning()

      if (result.length === 0) {
        throw new Error('Pelanggan not found')
      }

      return {
        success: true,
        message: 'Pelanggan updated successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error updating pelanggan:', error)
      
      if (error instanceof Error && error.message.includes('unique')) {
        throw new Error('Email already exists')
      }

      throw new Error(
        error instanceof Error ? error.message : 'Failed to update pelanggan'
      )
    }
  })

export const deletePelanggan = createServerFn()
  .validator((id: string) => idValidator.parse(id))
  .handler(async ({ data: id }): Promise<ApiResponse<boolean>> => {
    console.info(`Deleting pelanggan with ID: ${id}`)

    try {
      const result = await db.delete(pelanggan).where(eq(pelanggan.id, id))

      if (result.count === 0) {
        throw new Error('Pelanggan not found')
      }

      return {
        success: true,
        message: 'Pelanggan deleted successfully',
        data: true,
      }
    } catch (error) {
      console.error('Error deleting pelanggan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete pelanggan'
      )
    }
  })