// src/server/cron.ts
import { db } from '@/db/index'
import { templateTagihan, tagihan } from '@/db/schema/system'
import { eq, and, sql } from 'drizzle-orm'
import cron from 'node-cron'
// Import existing functions
import { generateTagihan } from '@/features/system/server/tagihan_management'

async function generateAutoTagihanBySchedule() {
  console.info(
    'Starting automated tagihan generation based on template schedule...'
  )

  try {
    const today = new Date()
    const currentDate = today.toISOString().split('T')[0]

    // Ambil template yang aktif dan sudah waktunya generate
    const eligibleTemplates = await db
      .select()
      .from(templateTagihan)
      .where(
        and(
          eq(templateTagihan.aktif, true),
          sql`${templateTagihan.tanggalMulai} <= ${currentDate}`
        )
      )

    if (eligibleTemplates.length === 0) {
      console.log('No eligible templates found for generation today')
      return
    }

    console.log(`Found ${eligibleTemplates.length} eligible templates`)

    let totalGenerated = 0
    let totalErrors = 0

    for (const template of eligibleTemplates) {
      try {
        console.log(`Checking template: ${template.nama}`)

        // Hitung apakah hari ini adalah hari untuk generate berdasarkan periode
        const templateStartDate = new Date(template.tanggalMulai)

        let shouldGenerate = false

        switch (template.periode) {
          case 'bulanan': {
            // Perbaikan: Handle edge case untuk akhir bulan
            const lastDayOfMonth = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0
            ).getDate()

            // Jika template mulai tanggal 31 tapi bulan ini cuma 30 hari,
            // generate di tanggal 30
            const targetDate = Math.min(
              templateStartDate.getDate(),
              lastDayOfMonth
            )

            shouldGenerate = today.getDate() === targetDate
            break
          }
          case 'tahunan':
            shouldGenerate =
              today.getDate() === templateStartDate.getDate() &&
              today.getMonth() === templateStartDate.getMonth()
            break
          default:
            shouldGenerate = false
        }

        if (!shouldGenerate) {
          console.log(
            `Template ${template.nama} not scheduled for today (${template.periode})`
          )
          continue
        }

        // Cek apakah sudah ada tagihan untuk periode ini
        const existingTagihan = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(tagihan)
          .where(
            and(
              eq(tagihan.templateId, template.id),
              sql`DATE(${tagihan.tanggal}) = ${currentDate}`
            )
          )

        if (existingTagihan[0].count > 0) {
          console.log(
            `Template ${template.nama} already generated today, skipping...`
          )
          continue
        }

        // Perbaikan: Hitung jatuh tempo secara dinamis
        // Asumsi: template.jatuhTempo menyimpan jumlah hari dari tanggal tagihan
        const jatuhTempoHari = template.jatuhTempo || 10 // Default 10 hari
        const jatuhTempoDate = new Date(today)
        jatuhTempoDate.setDate(today.getDate() + Number(jatuhTempoHari))
        const jatuhTempo = jatuhTempoDate.toISOString().split('T')[0]

        // Generate tagihan menggunakan fungsi yang sudah ada
        // Wrapped dalam transaction implicitly oleh generateTagihan
        const generateResult = await generateTagihan({
          data: {
            templateId: template.id,
            tanggal: currentDate,
            jatuhTempo: jatuhTempo,
            deskripsi: `${template.nama} - Auto Generated (${template.periode})`,
          },
        })

        if (generateResult.success && generateResult.data) {
          totalGenerated += generateResult.data.length
          console.log(
            `✅ Generated ${generateResult.data.length} tagihan for template: ${template.nama} (${template.periode})`
          )
        } else {
          console.error(
            `❌ Failed to generate tagihan for template: ${template.nama}`
          )
          totalErrors++
        }
      } catch (error) {
        console.error(`💥 Error processing template ${template.nama}:`, error)
        totalErrors++
      }
    }

    console.log(`\n📊 Automated tagihan generation completed!`)
    console.log(`   ✅ Total generated: ${totalGenerated}`)
    console.log(`   ❌ Total errors: ${totalErrors}`)
  } catch (error) {
    console.error('💥 Fatal error in automated tagihan generation:', error)
  }
}

// Function untuk cek tagihan yang jatuh tempo
async function checkJatuhTempo() {
  console.info('⏰ Checking for overdue tagihan...')

  try {
    const today = new Date().toISOString().split('T')[0]

    // Wrapped dalam transaction untuk konsistensi
    await db.transaction(async (tx) => {
      // Update status tagihan yang sudah jatuh tempo
      const overdueTagihan = await tx
        .update(tagihan)
        .set({
          status: 'jatuh_tempo',
        })
        .where(
          and(
            sql`${tagihan.jatuhTempo} < ${today}`,
            eq(tagihan.status, 'belum_lunas')
          )
        )
        .returning({ id: tagihan.id, noTagihan: tagihan.noTagihan })

      if (overdueTagihan.length > 0) {
        console.log(
          `📅 Updated ${overdueTagihan.length} tagihan to overdue status`
        )
        overdueTagihan.forEach((t) => {
          console.log(`   🔔 Tagihan ${t.noTagihan} is now overdue`)
        })
      } else {
        console.log('✅ No overdue tagihan found')
      }
    })
  } catch (error) {
    console.error('💥 Error checking overdue tagihan:', error)
    throw error // Re-throw untuk monitoring
  }
}

// Function untuk cleanup/archive tagihan lama (opsional)
async function cleanupOldTagihan() {
  console.info('🧹 Starting cleanup of old tagihan...')

  try {
    // Perbaikan: Archive tagihan yang sudah lebih dari 5 tahun dan sudah lunas
    // Lebih aman untuk audit dan compliance
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    const cutoffDate = fiveYearsAgo.toISOString().split('T')[0]

    await db.transaction(async (tx) => {
      // Opsi 1: Soft delete dengan flag archived
      // Uncomment jika ada kolom 'archived' di schema
      /*
      const archivedCount = await tx
        .update(tagihan)
        .set({ 
          archived: true,
          archivedAt: new Date()
        })
        .where(
          and(
            sql`${tagihan.createdAt} < ${cutoffDate}`,
            eq(tagihan.status, 'lunas'),
            eq(tagihan.archived, false)
          )
        )
        .returning({ id: tagihan.id })

      console.log(`📦 Archived ${archivedCount.length} old paid tagihan`)
      */

      // Opsi 2: Hard delete (gunakan dengan hati-hati)
      // Hanya untuk sistem yang tidak memerlukan historical data lama
      const deletedCount = await tx
        .delete(tagihan)
        .where(
          and(
            sql`${tagihan.createdAt} < ${cutoffDate}`,
            eq(tagihan.status, 'lunas')
          )
        )
        .returning({ id: tagihan.id })

      console.log(
        `🗑️  Cleaned up ${deletedCount.length} old paid tagihan (>5 years)`
      )

      if (deletedCount.length > 0) {
        console.log(`   ℹ️  Deleted tagihan older than: ${cutoffDate}`)
      }
    })
  } catch (error) {
    console.error('💥 Error in cleanup process:', error)
    throw error // Re-throw untuk monitoring
  }
}

export function startCronJobs() {
  console.log('🚀 Starting cron jobs...')

  // Generate tagihan berdasarkan jadwal template - jalan setiap hari untuk cek semua template
  cron.schedule(
    '0 6 * * *',
    async () => {
      console.log('\n' + '='.repeat(60))
      console.log('🔄 Daily template-based tagihan generation check')
      console.log('⏰ Time:', new Date().toISOString())
      console.log('='.repeat(60))
      try {
        await generateAutoTagihanBySchedule()
      } catch (error) {
        console.error('💥 Cron job failed:', error)
        // TODO: Send alert/notification
      }
    },
    {
      timezone: 'Asia/Jakarta',
    }
  )

  // Cek tagihan jatuh tempo setiap hari jam 08:00
  cron.schedule(
    '0 8 * * *',
    async () => {
      console.log('\n' + '='.repeat(60))
      console.log('🔄 Daily overdue check triggered')
      console.log('⏰ Time:', new Date().toISOString())
      console.log('='.repeat(60))
      try {
        await checkJatuhTempo()
      } catch (error) {
        console.error('💥 Cron job failed:', error)
        // TODO: Send alert/notification
      }
    },
    {
      timezone: 'Asia/Jakarta',
    }
  )

  // Cleanup/Archive tagihan lama setiap bulan tanggal 1 jam 02:00
  cron.schedule(
    '0 2 1 * *',
    async () => {
      console.log('\n' + '='.repeat(60))
      console.log('🔄 Monthly cleanup triggered')
      console.log('⏰ Time:', new Date().toISOString())
      console.log('='.repeat(60))
      try {
        await cleanupOldTagihan()
      } catch (error) {
        console.error('💥 Cron job failed:', error)
        // TODO: Send alert/notification
      }
    },
    {
      timezone: 'Asia/Jakarta',
    }
  )

  // Test cron untuk development - uncomment jika diperlukan untuk testing
  // cron.schedule('*/10 * * * *', async () => {
  //   console.log('🧪 Test cron - checking templates:', new Date().toISOString())
  //   await generateAutoTagihanBySchedule()
  // })

  // Cron untuk monitoring - setiap jam
  cron.schedule(
    '0 * * * *',
    () => {
      console.log('💓 Cron system heartbeat:', new Date().toISOString())
    },
    {
      timezone: 'Asia/Jakarta',
    }
  )

  console.log('\n✅ All cron jobs registered successfully!')
  console.log('\n📅 Scheduled jobs:')
  console.log('  • Template-based tagihan generation: Daily at 06:00')
  console.log('    (Checks all template schedules with improved date handling)')
  console.log('  • Daily overdue check: Every day at 08:00')
  console.log('    (Updates status with transaction safety)')
  console.log('  • Monthly cleanup: 1st day at 02:00')
  console.log('    (Archives/deletes tagihan older than 5 years)')
  console.log('  • Hourly heartbeat: Every hour at :00')
  console.log('    (System health monitoring)')
  console.log('\n' + '='.repeat(60) + '\n')
}
