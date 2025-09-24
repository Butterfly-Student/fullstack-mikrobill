import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(67890)

// Mock user IDs for foreign key references
const userIds = Array.from({ length: 50 }, () => faker.string.uuid())

export const sessions = Array.from({ length: 500 }, () => {
  const createdAt = faker.date.past()
  const expiresAt = faker.date.future({ refDate: createdAt })

  return {
    id: faker.string.uuid(),
    expiresAt,
    token: faker.string.alphanumeric({ length: 64 }),
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
    ipAddress:
      faker.helpers.maybe(() => faker.internet.ip(), { probability: 0.9 }) ??
      null,
    userAgent:
      faker.helpers.maybe(() => faker.internet.userAgent(), {
        probability: 0.85,
      }) ?? null,
    userId: faker.helpers.arrayElement(userIds),
    impersonatedBy:
      faker.helpers.maybe(() => faker.helpers.arrayElement(userIds), {
        probability: 0.1,
      }) ?? null,
  }
})
