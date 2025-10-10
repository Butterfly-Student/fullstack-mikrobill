import path from 'path';
import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { Eta } from 'eta';
import fs from 'fs/promises';


const templateDir = path.resolve('templates')
const eta = new Eta({ views: templateDir })

export const getTemplate = createServerFn()
  .validator((data) => {
    return z
      .object({
        file: z.string().min(1, 'File parameter is required'),
      })
      .parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const { file } = data

      if (file.includes('..')) {
        throw new Error('Invalid file path')
      }

      const filePath = path.join(templateDir, file)
      const content = await fs.readFile(filePath, 'utf-8')

      return { success: true, content }
    } catch (error) {
      console.error('Error reading template:', error)
      throw new Error('Failed to read template file')
    }
  })

export const saveTemplate = createServerFn()
  .validator((data) => {
    return z
      .object({
        file: z.string().min(1, 'File parameter is required'),
        content: z.string(),
      })
      .parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const { file, content } = data

      if (file.includes('..')) {
        throw new Error('Invalid file path')
      }

      const filePath = path.join(templateDir, file)
      await fs.writeFile(filePath, content, 'utf-8')

      return { success: true, message: 'Template saved successfully' }
    } catch (error) {
      console.error('Error saving template:', error)
      throw new Error('Failed to save template file')
    }
  })

export const renderTemplate = createServerFn({method:"POST"})
  .validator((data) => {
    return z
      .object({
        file: z.string().min(1, 'File parameter is required'),
        data: z.array(z.record(z.string(), z.any())),
      })
      .parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const { file, data: items } = data

      if (file.includes('..')) {
        throw new Error('Invalid file path')
      }
      
      const filePath = path.join(templateDir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      console.log("params", items)
      // Render menggunakan Eta
      const rendered = eta.renderString(content, { data: items })

      return { success: true, html: rendered }
    } catch (error) {
      console.error('Error rendering template:', error)
      throw new Error('Failed to render template')
    }
  })