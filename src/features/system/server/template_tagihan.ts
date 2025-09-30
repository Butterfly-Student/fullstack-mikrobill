import { z } from 'zod';
import { db } from '@/db';
import { templateTagihan, type TemplateTagihan } from '@/db/schema/system';
import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';
import { type TemplateTagihanForm, templateTagihanFormSchema } from '../template_tagihan/data/schema';


const updateTemplateTagihanValidator = templateTagihanFormSchema.partial()


const idValidator = z.uuid('Invalid ID format')


type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
}

export const getAllTemplateTagihan = createServerFn().handler(
  async (): Promise<ApiResponse<TemplateTagihan[]>> => {
    console.info('Fetching all template tagihan...')

    try {
      const result = await db
        .select()
        .from(templateTagihan)
        .orderBy(desc(templateTagihan.createdAt))

      return {
        success: true,
        message: 'Template tagihan fetched successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error fetching template tagihan:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch template tagihan'
      )
    }
  }
)

export const getTemplateTagihanById = createServerFn()
  .validator((id: string) => idValidator.parse(id))
  .handler(
    async ({ data: id }): Promise<ApiResponse<TemplateTagihan | null>> => {
      console.info(`Fetching template tagihan with ID: ${id}`)

      try {
        const result = await db
          .select()
          .from(templateTagihan)
          .where(eq(templateTagihan.id, id))
          .limit(1)

        return {
          success: true,
          message: result[0]
            ? 'Template tagihan found'
            : 'Template tagihan not found',
          data: result[0] || null,
        }
      } catch (error) {
        console.error('Error fetching template tagihan by ID:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to fetch template tagihan'
        )
      }
    }
  )


export const createTemplateTagihan = createServerFn()
  .validator((data) => templateTagihanFormSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<TemplateTagihan>> => {
    console.info('Creating new template tagihan...')

    try {

      const result = await db.insert(templateTagihan).values(data).returning()

      return {
        success: true,
        message: 'Template tagihan created successfully',
        data: result[0],
      }
    } catch (error) {
      console.error('Error creating template tagihan:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to create template tagihan'
      )
    }
  })

export const updateTemplateTagihan = createServerFn()
  .validator((input: { id: string; data: Partial<TemplateTagihanForm> }) => ({
    id: idValidator.parse(input.id),
    data: updateTemplateTagihanValidator.parse(input.data),
  }))
  .handler(
    async ({ data: { id, data } }): Promise<ApiResponse<TemplateTagihan>> => {
      console.info(`Updating template tagihan with ID: ${id}`)

      try {

        const result = await db
          .update(templateTagihan)
          .set(data)
          .where(eq(templateTagihan.id, id))
          .returning()

        if (result.length === 0) {
          throw new Error('Template tagihan not found')
        }

        return {
          success: true,
          message: 'Template tagihan updated successfully',
          data: result[0],
        }
      } catch (error) {
        console.error('Error updating template tagihan:', error)
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to update template tagihan'
        )
      }
    }
  )

export const deleteTemplateTagihan = createServerFn()
  .validator((id: string) => idValidator.parse(id))
  .handler(async ({ data: id }): Promise<ApiResponse<boolean>> => {
    console.info(`Deleting template tagihan with ID: ${id}`)

    try {
      const result = await db
        .delete(templateTagihan)
        .where(eq(templateTagihan.id, id))

      if (result.count === 0) {
        throw new Error('Template tagihan not found')
      }

      return {
        success: true,
        message: 'Template tagihan deleted successfully',
        data: true,
      }
    } catch (error) {
      console.error('Error deleting template tagihan:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to delete template tagihan'
      )
    }
  })