import { faker } from "@faker-js/faker"
import type { Tagihan, TagihanStatus } from "./schema"

faker.seed(13579)

export function idr(n: number) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 2 }).format(n)
  } catch {
    return `Rp ${n.toFixed(2)}`
  }
}

function iso(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, "0")
  const day = `${d.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const tagihan: Tagihan[] = Array.from({ length: 50 }, () => {
  const tanggal = faker.date.recent({ days: 30 })
  const jatuhTempo = faker.date.soon({ days: 14, refDate: tanggal })
  const total = Number(faker.finance.amount({ min: 50000, max: 5000000, dec: 0 }))
  const status: TagihanStatus = faker.helpers.arrayElement(["belum_lunas", "lunas", "jatuh_tempo"] as const)

  return {
    id: faker.string.uuid(),
    noTagihan: `INV-${faker.string.alphanumeric({ length: 6, casing: "upper" })}`,
    tanggal: iso(tanggal),
    jatuhTempo: iso(jatuhTempo),
    deskripsi: faker.lorem.sentence(),
    status,
    total,
    pelangganId: faker.string.uuid(),
    templateId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.3 }) || undefined,
    createdAt: faker.date.past().toISOString(),
  }
})
