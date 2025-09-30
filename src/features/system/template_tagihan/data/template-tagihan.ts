import { faker } from "@faker-js/faker"
import type { TemplateTagihan } from "./schema"

export const templateTagihan = Array.from({ length: 50 }, (): TemplateTagihan => {
  return {
    id: faker.string.uuid(),
    pelangganId: faker.string.uuid(),
    nama: faker.commerce.productName(),
    deskripsi: faker.commerce.productDescription(),
    jumlah: faker.commerce.price({ min: 10000, max: 1000000 }),
    periode: faker.helpers.arrayElement(["bulanan", "tahunan", "mingguan", "harian"]),
    tanggalMulai: faker.date.recent().toISOString().split("T")[0],
    aktif: faker.datatype.boolean(),
    createdAt: faker.date.recent().toISOString(),
  }
})
