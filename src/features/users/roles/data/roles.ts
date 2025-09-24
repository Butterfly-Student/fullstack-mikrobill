import { faker } from '@faker-js/faker'
import { permissions } from '../../permissions/data/permissions'
import type { RoleRelation } from './schema'

// Seed biar hasil tetap konsisten
faker.seed(24680)

export const rolesWithPermissions: RoleRelation[] = Array.from(
  { length: 5 }, // generate 5 role relations
  (_, i) => ({
    id: i + 1,
    name: faker.internet.displayName(),
    description: faker.helpers.maybe(() => faker.lorem.sentence(), {
      probability: 0.8,
    }),

    // User-role part
    userId: faker.helpers.maybe(() => faker.string.uuid(), {
      probability: 0.7,
    }),
    assignedBy:
      faker.helpers.maybe(() => faker.string.uuid(), {
        probability: 0.5,
      }) ?? null, // 👈 fix: fallback ke null
    assignedAt: faker.helpers.maybe(() => faker.date.past(), {
      probability: 0.7,
    }),

    // Role-permission part (required, min 1)
    permissions: faker.helpers.arrayElements(permissions, {
      min: 1,
      max: Math.min(permissions.length, 5),
    }),
    grantedAt: faker.helpers.maybe(() => faker.date.past(), {
      probability: 0.8,
    }),
  })
)
