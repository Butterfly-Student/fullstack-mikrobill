import { db } from "@/db/index";
import { pelanggan } from "@/db/schema/system";
import { faker } from "@faker-js/faker";


const fakerData = async () => {
  faker.seed(24680)

  const pelangganData = Array.from({ length: 50 }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: '', // placeholder
    alamat: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    telepon: faker.phone.number(),
    createdAt: faker.date.past(),
  }))
  await db.insert(pelanggan).values(pelangganData)
  console.log('50 data pelanggan berhasil di-insert!')
}

fakerData()