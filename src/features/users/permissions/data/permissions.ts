import { faker } from '@faker-js/faker'

// Seed biar konsisten
faker.seed(12345)

export const resources = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: faker.helpers.arrayElement([
    'users',
    'roles',
    'permissions',
    'billing',
  ]),
  description: faker.lorem.sentence(),
  createdAt: faker.date.past(),
}))

export const actions = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: faker.helpers.arrayElement(['create', 'read', 'update', 'delete']),
  description: faker.lorem.sentence(),
  createdAt: faker.date.past(),
}))

export const permissions = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `${faker.helpers.arrayElement(['create', 'read', 'update', 'delete'])}_${faker.helpers.arrayElement(['users', 'roles', 'permissions', 'billing'])}`,
  description: faker.lorem.sentence(),
  resourceId: faker.helpers.arrayElement(resources).id,
  actionId: faker.helpers.arrayElement(actions).id,
  createdAt: faker.date.past(),
}))
