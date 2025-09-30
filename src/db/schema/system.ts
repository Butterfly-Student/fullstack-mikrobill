import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, decimal, date, timestamp, pgEnum, boolean, uuid } from 'drizzle-orm/pg-core';


// ========================
// ENUM
// ========================
export const kasJenisEnum = pgEnum('kas_jenis', ['masuk', 'keluar'])
export const periodeEnum = pgEnum('periode', ['bulanan', 'tahunan'])
export const tagihanStatusEnum = pgEnum('tagihan_status', [
  'belum_lunas',
  'lunas',
  'jatuh_tempo',
  'sebagian',
])
export const metodeEnum = pgEnum('metode', ['cash', 'transfer', 'lain'])


export const kas = pgTable('kas', {
  id: uuid('id').primaryKey().defaultRandom(),
  tanggal: timestamp('tanggal').defaultNow(),
  keterangan: text('keterangan'),
  jenis: kasJenisEnum('jenis').notNull(),
  jumlah: decimal('jumlah', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const pelanggan = pgTable('pelanggan', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).unique(),
  password: varchar('password', { length: 255 }),
  alamat: text('alamat'),
  telepon: varchar('telepon', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const templateTagihan = pgTable('template_tagihan', {
  id: uuid('id').primaryKey().defaultRandom(),
  nama: varchar('nama', { length: 100 }).notNull(),
  deskripsi: text('deskripsi'),
  jumlah: decimal('jumlah', { precision: 15, scale: 2 }).notNull(),
  periode: periodeEnum('periode').default('bulanan'),
  tanggalMulai: date('tanggal_mulai').notNull(),
  jatuhTempo: date('jatuh_tempo').default(
    sql`CURRENT_DATE + INTERVAL '10 days'`
  ),
  aktif: boolean('aktif').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const tagihan = pgTable('tagihan', {
  id: uuid('id').primaryKey().defaultRandom(),
  noTagihan: varchar('no_tagihan', { length: 50 }).notNull().unique(),
  tanggal: date('tanggal').notNull(),
  jatuhTempo: date('jatuh_tempo').notNull(),
  deskripsi: text('deskripsi'),
  status: tagihanStatusEnum('status').default('belum_lunas'),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  pelangganId: uuid('pelanggan_id')
    .notNull()
    .references(() => pelanggan.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => templateTagihan.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const pembayaranTagihan = pgTable('pembayaran_tagihan', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagihanId: uuid('tagihan_id')
    .notNull()
    .references(() => tagihan.id, { onDelete: 'cascade' }),
  userId: uuid('pelanggan_id')
    .notNull()
    .references(() => pelanggan.id, { onDelete: 'cascade' }),
  tanggal: date('tanggal').notNull(),
  jumlah: decimal('jumlah', { precision: 15, scale: 2 }).notNull(),
  metode: metodeEnum('metode').default('cash'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Tambahkan tabel ini di schema Anda
export const pelangganTemplate = pgTable('pelanggan_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  pelangganId: uuid('pelanggan_id')
    .notNull()
    .references(() => pelanggan.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id')
    .notNull()
    .references(() => templateTagihan.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
})

export type PelangganTemplate = typeof pelangganTemplate.$inferSelect
export type NewPelangganTemplate = typeof pelangganTemplate.$inferInsert

export type Pelanggan = typeof pelanggan.$inferSelect
export type NewPelanggan = typeof pelanggan.$inferInsert

export type Kas = typeof kas.$inferSelect
export type NewKas = typeof kas.$inferInsert

export type TemplateTagihan = typeof templateTagihan.$inferSelect
export type NewTemplateTagihan = typeof templateTagihan.$inferInsert

export type Tagihan = typeof tagihan.$inferSelect
export type NewTagihan = typeof tagihan.$inferInsert

export type PembayaranTagihan = typeof pembayaranTagihan.$inferSelect
export type NewPembayaranTagihan = typeof pembayaranTagihan.$inferInsert