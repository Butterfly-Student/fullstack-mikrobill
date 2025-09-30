import { faker } from "@faker-js/faker"
import type { Kas } from "./schema"

faker.seed(13579)

const jenisList: Kas["jenis"][] = ["masuk", "keluar"]

export const kas: Kas[] = Array.from({ length: 50 }, () => {
  const jenis = faker.helpers.arrayElement(jenisList)
  // nilai jumlah: masuk positif, keluar positif (nanti bisa diberi tanda - saat render jika diinginkan)
  const jumlah = Number(faker.finance.amount({ min: 10000, max: 5_000_000, dec: 0 }))

  const d = faker.date.recent({ days: 120 })
  const tanggalIso = d.toISOString().slice(0, 10) // yyyy-MM-dd

  return {
    id: faker.string.uuid(),
    tanggal: tanggalIso,
    keterangan: faker.lorem.sentence({ min: 3, max: 8 }),
    jenis,
    jumlah,
    createdAt: d.toISOString(),
  }
})
