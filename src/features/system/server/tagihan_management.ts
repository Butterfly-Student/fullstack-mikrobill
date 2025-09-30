import { z } from 'zod';
import { db } from '@/db/index';
// Sesuaikan dengan path database Anda
import { tagihan, pembayaranTagihan, pelanggan, templateTagihan, kas, type NewTagihan, type NewPembayaranTagihan, type Tagihan, type PembayaranTagihan, type Pelanggan } from '@/db/schema/system';
import { createServerFn } from '@tanstack/react-start';
// Sesuaikan dengan path schema Anda
import { eq, and, sql, desc } from 'drizzle-orm';


export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

export interface PelangganWithTagihan extends Pelanggan {
  tagihan: (Tagihan & {
    pembayaran: PembayaranTagihan[]
    totalDibayar: string
    sisaTagihan: string
  })[]
}

// ========================
// ZOD SCHEMAS
// ========================
const generateTagihanSchema = z.object({
  templateId: z.uuid('Invalid template ID').optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  jatuhTempo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  deskripsi: z.string().optional(),
  jumlah: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Invalid amount').optional()
})

const bayarTagihanSchema = z.object({
  tagihanId: z.string().uuid('Invalid tagihan ID'),
  pelangganId: z.string().uuid('Invalid pelanggan ID'),
  jumlah: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Invalid amount'),
  metode: z.enum(['cash', 'transfer', 'lain']),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
})

const updateStatusTagihanSchema = z.object({
  tagihanId: z.string().uuid('Invalid tagihan ID'),
  status: z.enum(['belum_lunas', 'lunas', 'jatuh_tempo', 'sebagian'])
})

const getPelangganSchema = z.object({
  pelangganId: z.string().uuid('Invalid pelanggan ID').optional()
})

// ========================
// UTILITY FUNCTIONS
// ========================
function generateNoTagihan(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const timestamp = now.getTime().toString().slice(-6)
  
  return `INV-${year}${month}${day}-${timestamp}`
}

async function hitungStatusTagihan(tagihanId: string, totalTagihan: string): Promise<'belum_lunas' | 'lunas' | 'sebagian'> {
  const pembayaranResult = await db
    .select({ 
      total: sql<string>`COALESCE(SUM(${pembayaranTagihan.jumlah}), 0)` 
    })
    .from(pembayaranTagihan)
    .where(eq(pembayaranTagihan.tagihanId, tagihanId))

  const totalDibayar = parseFloat(pembayaranResult[0]?.total || '0')
  const totalTagihanFloat = parseFloat(totalTagihan)

  if (totalDibayar === 0) {
    return 'belum_lunas'
  } else if (totalDibayar >= totalTagihanFloat) {
    return 'lunas'
  } else {
    return 'sebagian'
  }
}

// ========================
// SERVER FUNCTIONS
// ========================

/**
 * Generate tagihan baru untuk semua pelanggan (dengan template optional)
 */
export const generateTagihan = createServerFn()
  .validator((data) => generateTagihanSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<Tagihan[]>> => {
    console.info('Generating tagihan for all pelanggan...')
    try {
      console.log('Data:', data)

      let template = null
      let jumlahTagihan = '0'
      let deskripsiTagihan = data.deskripsi || 'Tagihan'

      // Jika templateId disediakan, ambil data template
      if (data.templateId) {
        const templateResult = await db
          .select()
          .from(templateTagihan)
          .where(eq(templateTagihan.id, data.templateId))
          .limit(1)

        if (!templateResult[0]) {
          throw new Error('Template tagihan tidak ditemukan')
        }

        if (!templateResult[0].aktif) {
          throw new Error('Template tagihan tidak aktif')
        }

        template = templateResult[0]
        jumlahTagihan = template.jumlah
        deskripsiTagihan = data.deskripsi || template.deskripsi || template.nama
      } else {
        // Jika tidak ada template, jumlah harus disediakan
        if (!data.jumlah) {
          throw new Error('Jumlah tagihan harus disediakan jika tidak menggunakan template')
        }
        jumlahTagihan = data.jumlah
      }

      // Ambil semua pelanggan aktif
      const semuaPelanggan = await db.select().from(pelanggan)

      if (semuaPelanggan.length === 0) {
        throw new Error('Tidak ada pelanggan yang ditemukan')
      }

      console.log(`Generating tagihan for ${semuaPelanggan.length} pelanggan`)

      // Generate tagihan untuk setiap pelanggan
      const hasilTagihan: Tagihan[] = []
      const errors: string[] = []

      for (const pelangganData of semuaPelanggan) {
        try {
          // Generate nomor tagihan unik untuk setiap pelanggan
          let noTagihan: string
          let isUnique = false
          let attempts = 0

          do {
            noTagihan = generateNoTagihan()
            const existing = await db
              .select({ id: tagihan.id })
              .from(tagihan)
              .where(eq(tagihan.noTagihan, noTagihan))
              .limit(1)
            
            isUnique = !existing[0]
            attempts++
          } while (!isUnique && attempts < 10)

          if (!isUnique) {
            errors.push(`Gagal generate nomor tagihan unik untuk pelanggan ${pelangganData.name}`)
            continue
          }

          // Insert tagihan baru
          const newTagihan: NewTagihan = {
            noTagihan: noTagihan!,
            tanggal: data.tanggal,
            jatuhTempo: data.jatuhTempo,
            deskripsi: deskripsiTagihan,
            status: 'belum_lunas',
            total: jumlahTagihan,
            pelangganId: pelangganData.id,
            templateId: data.templateId || null
          }

          const result = await db.insert(tagihan).values(newTagihan).returning()
          hasilTagihan.push(result[0])

          console.log(`Tagihan berhasil dibuat untuk pelanggan: ${pelangganData.name}`)
        } catch (error) {
          console.error(`Error creating tagihan for pelanggan ${pelangganData.name}:`, error)
          errors.push(`Gagal membuat tagihan untuk ${pelangganData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Jika ada error tetapi masih ada yang berhasil
      if (errors.length > 0 && hasilTagihan.length > 0) {
        console.warn('Some tagihan creation failed:', errors)
        return {
          success: true,
          message: `${hasilTagihan.length} tagihan berhasil dibuat, ${errors.length} gagal. Errors: ${errors.join('; ')}`,
          data: hasilTagihan
        }
      }

      // Jika semua gagal
      if (hasilTagihan.length === 0) {
        throw new Error(`Gagal membuat tagihan untuk semua pelanggan. Errors: ${errors.join('; ')}`)
      }

      // Jika semua berhasil
      return {
        success: true,
        message: `${hasilTagihan.length} tagihan berhasil dibuat untuk semua pelanggan`,
        data: hasilTagihan
      }
    } catch (error) {
      console.error('Error generating tagihan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate tagihan'
      )
    }
  })

/**
 * Bayar tagihan
 */
export const bayarTagihan = createServerFn()
  .validator((data) => bayarTagihanSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<{
    pembayaran: PembayaranTagihan,
    statusTagihan: string,
    sisaTagihan: number
  }>> => {
    console.info('Processing payment for tagihan...')
    try {
      console.log('Payment data:', data)

      const jumlahFloat = parseFloat(data.jumlah)

      // Ambil data tagihan
      const tagihanData = await db
        .select()
        .from(tagihan)
        .where(and(
          eq(tagihan.id, data.tagihanId),
          eq(tagihan.pelangganId, data.pelangganId)
        ))
        .limit(1)

      if (!tagihanData[0]) {
        throw new Error('Tagihan tidak ditemukan atau bukan milik pelanggan ini')
      }

      // Hitung total pembayaran sebelumnya
      const pembayaranSebelumnya = await db
        .select({ 
          total: sql<string>`COALESCE(SUM(${pembayaranTagihan.jumlah}), 0)` 
        })
        .from(pembayaranTagihan)
        .where(eq(pembayaranTagihan.tagihanId, data.tagihanId))

      const totalDibayar = parseFloat(pembayaranSebelumnya[0]?.total || '0')
      const totalTagihan = parseFloat(tagihanData[0].total)
      const sisaTagihan = totalTagihan - totalDibayar

      // Validasi jumlah pembayaran
      if (jumlahFloat > sisaTagihan) {
        throw new Error(`Jumlah pembayaran melebihi sisa tagihan. Sisa: Rp ${sisaTagihan.toLocaleString('id-ID')}`)
      }

      if (sisaTagihan <= 0) {
        throw new Error('Tagihan sudah lunas')
      }

      // Insert pembayaran
      const newPembayaran: NewPembayaranTagihan = {
        tagihanId: data.tagihanId,
        userId: data.pelangganId,
        tanggal: data.tanggal,
        jumlah: data.jumlah,
        metode: data.metode
      }

      const pembayaranResult = await db.insert(pembayaranTagihan).values(newPembayaran).returning()

      // Hitung status tagihan baru
      const statusBaru = await hitungStatusTagihan(data.tagihanId, tagihanData[0].total)

      // Update status tagihan
      await db
        .update(tagihan)
        .set({ status: statusBaru })
        .where(eq(tagihan.id, data.tagihanId))

      // Insert ke kas jika pembayaran berhasil
      await db.insert(kas).values({
        tanggal: new Date(data.tanggal + 'T00:00:00Z'),
        keterangan: `Pembayaran tagihan ${tagihanData[0].noTagihan}`,
        jenis: 'masuk',
        jumlah: data.jumlah
      })

      const sisaBaru = sisaTagihan - jumlahFloat

      return {
        success: true,
        message: 'Pembayaran berhasil dicatat',
        data: {
          pembayaran: pembayaranResult[0],
          statusTagihan: statusBaru,
          sisaTagihan: sisaBaru
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to process payment'
      )
    }
  })

/**
 * Update status tagihan secara manual
 */
export const updateStatusTagihan = createServerFn()
  .validator((data) => updateStatusTagihanSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<Tagihan>> => {
    console.info('Updating tagihan status...')
    try {
      console.log('Update status data:', data)

      // Cek apakah tagihan ada
      const tagihanExists = await db
        .select()
        .from(tagihan)
        .where(eq(tagihan.id, data.tagihanId))
        .limit(1)

      if (!tagihanExists[0]) {
        throw new Error('Tagihan tidak ditemukan')
      }

      // Jika status akan diubah ke 'lunas', validasi apakah pembayaran sudah cukup
      if (data.status === 'lunas') {
        const totalTagihan = parseFloat(tagihanExists[0].total)
        const pembayaranTotal = await db
          .select({ 
            total: sql<string>`COALESCE(SUM(${pembayaranTagihan.jumlah}), 0)` 
          })
          .from(pembayaranTagihan)
          .where(eq(pembayaranTagihan.tagihanId, data.tagihanId))

        const totalDibayar = parseFloat(pembayaranTotal[0]?.total || '0')
        
        if (totalDibayar < totalTagihan) {
          throw new Error(`Tidak dapat mengubah status ke lunas. Total dibayar: Rp ${totalDibayar.toLocaleString('id-ID')}, Total tagihan: Rp ${totalTagihan.toLocaleString('id-ID')}`)
        }
      }

      // Update status
      const result = await db
        .update(tagihan)
        .set({ status: data.status })
        .where(eq(tagihan.id, data.tagihanId))
        .returning()

      return {
        success: true,
        message: 'Status tagihan berhasil diupdate',
        data: result[0]
      }
    } catch (error) {
      console.error('Error updating tagihan status:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update tagihan status'
      )
    }
  })

/**
 * Get pelanggan dengan semua tagihan dan pembayarannya
 */
export const getPelangganWithTagihan = createServerFn()
  .validator((data) => getPelangganSchema.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<PelangganWithTagihan | PelangganWithTagihan[]>> => {
    console.info('Fetching pelanggan with tagihan...')
    try {
      console.log('Get pelanggan data:', data)

      // Query builder untuk pelanggan
      let pelangganQuery = db.select().from(pelanggan)
      
      if (data.pelangganId) {
        pelangganQuery = pelangganQuery.where(eq(pelanggan.id, data.pelangganId))
      }

      const pelangganData = await pelangganQuery

      if (data.pelangganId && !pelangganData[0]) {
        throw new Error('Pelanggan tidak ditemukan')
      }

      // Untuk setiap pelanggan, ambil tagihan dan pembayarannya
      const pelangganWithTagihan: PelangganWithTagihan[] = await Promise.all(
        pelangganData.map(async (p) => {
          // Ambil semua tagihan pelanggan
          const tagihanData = await db
            .select()
            .from(tagihan)
            .where(eq(tagihan.pelangganId, p.id))
            .orderBy(desc(tagihan.createdAt))

          // Untuk setiap tagihan, ambil pembayarannya
          const tagihanWithPembayaran = await Promise.all(
            tagihanData.map(async (t) => {
              const pembayaranData = await db
                .select()
                .from(pembayaranTagihan)
                .where(eq(pembayaranTagihan.tagihanId, t.id))
                .orderBy(desc(pembayaranTagihan.createdAt))

              // Hitung total dibayar
              const totalDibayar = pembayaranData.reduce(
                (sum, p) => sum + parseFloat(p.jumlah), 
                0
              ).toString()

              const sisaTagihan = (parseFloat(t.total) - parseFloat(totalDibayar)).toString()

              return {
                ...t,
                pembayaran: pembayaranData,
                totalDibayar,
                sisaTagihan
              }
            })
          )

          return {
            ...p,
            tagihan: tagihanWithPembayaran
          }
        })
      )

      const result = data.pelangganId ? pelangganWithTagihan[0] : pelangganWithTagihan

      return {
        success: true,
        message: 'Data berhasil diambil',
        data: result
      }
    } catch (error) {
      console.error('Error fetching pelanggan with tagihan:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch pelanggan data'
      )
    }
  })

/**
 * Get summary tagihan untuk dashboard
 */
export const getTagihanSummary = createServerFn()
  .validator(() => ({})) // No input validation needed
  .handler(async (): Promise<ApiResponse<{
    summaryByStatus: Array<{
      status: string | null,
      count: number,
      total: string
    }>,
    pembayaranBulanIni: string
  }>> => {
    console.info('Fetching tagihan summary...')
    try {
      // Total tagihan berdasarkan status
      const summaryByStatus = await db
        .select({
          status: tagihan.status,
          count: sql<number>`COUNT(*)`,
          total: sql<string>`COALESCE(SUM(${tagihan.total}), 0)`
        })
        .from(tagihan)
        .groupBy(tagihan.status)

      // Total pembayaran bulan ini
      const currentMonth = new Date()
      currentMonth.setDate(1) // Awal bulan
      
      const pembayaranBulanIni = await db
        .select({
          total: sql<string>`COALESCE(SUM(${pembayaranTagihan.jumlah}), 0)`
        })
        .from(pembayaranTagihan)
        .where(sql`${pembayaranTagihan.tanggal} >= ${currentMonth.toISOString().split('T')[0]}`)

      return {
        success: true,
        message: 'Summary berhasil diambil',
        data: {
          summaryByStatus,
          pembayaranBulanIni: pembayaranBulanIni[0]?.total || '0'
        }
      }
    } catch (error) {
      console.error('Error fetching tagihan summary:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch tagihan summary'
      )
    }
  })