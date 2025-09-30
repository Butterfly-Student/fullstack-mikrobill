import { faker } from "@faker-js/faker"

faker.seed(24680)

export const pelanggan = Array.from({ length: 50 }, () => {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: "", // tidak ditampilkan; placeholder
    alamat: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    telepon: faker.phone.number(),
    createdAt: faker.date.past().toISOString(),
  }
})
