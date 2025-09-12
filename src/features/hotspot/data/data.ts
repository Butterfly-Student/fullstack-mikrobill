import { faker } from '@faker-js/faker'
import { type UserList, type Profile } from './schema'

faker.seed(67890)

// maksimal 10 profiles
export const hotspotProfiles: Profile[] = Array.from(
  { length: faker.number.int({ min: 3, max: 10 }) },
  () => {
    return {
      profileName: faker.helpers.arrayElement([
        'default',
        'student',
        'staff',
        'premium',
        'guest',
        'vip',
        'silver',
        'gold',
        'platinum',
        'trial',
      ]),

      expiredMode: faker.helpers.arrayElement([
        '0',
        'rem',
        'remc',
        'ntf',
        'ntfc',
      ]),

      price: faker.number.int({ min: 1000, max: 100000 }),
      sellingPrice: faker.number.int({ min: 2000, max: 150000 }),

      lockUser: faker.helpers.arrayElement(['Enable', 'Disable']),
      lockServer: faker.helpers.arrayElement(['Enable', 'Disable']),

      sharedUsers: faker.number.int({ min: 1, max: 10 }),
      rateLimit: `${faker.number.int({ min: 256, max: 2048 })}k/${faker.number.int(
        {
          min: 512,
          max: 4096,
        }
      )}k`,

      validity: faker.helpers.arrayElement(['1d', '7d', '30d']),
      addressPool: faker.helpers.arrayElement(['dhcp', 'pool1', 'pool2']),
      parentQueue: faker.helpers.arrayElement(['none', 'parent1', 'parent2']),

      statusAutoRefresh: '1m', // default sesuai PHP
      onLogin: faker.helpers.maybe(() => ':put ("fake-login-script")'),

      // tambahan opsional
      bandwidth: faker.helpers.maybe(
        () => `${faker.number.int({ min: 1, max: 100 })}Mbps`
      ),
      sessionTimeout: faker.helpers.maybe(
        () => `${faker.number.int({ min: 1, max: 24 })}h`
      ),
      idleTimeout: faker.helpers.maybe(
        () => `${faker.number.int({ min: 1, max: 60 })}m`
      ),
      downloadLimit: faker.helpers.maybe(
        () => `${faker.number.int({ min: 100, max: 10000 })}MB`
      ),
      uploadLimit: faker.helpers.maybe(
        () => `${faker.number.int({ min: 100, max: 10000 })}MB`
      ),
      maxSessions: faker.helpers.maybe(() =>
        faker.number.int({ min: 1, max: 5 })
      ),
      description: faker.helpers.maybe(() => faker.lorem.sentence()),
    }
  }
)

const servers = ['hotspot1', 'hotspot2', 'hotspot3']
const profiles = hotspotProfiles.map((profile) => profile.profileName)

export const hotspotUsers: UserList = Array.from({ length: 20 }, () => {
  const passwordEnabled = faker.datatype.boolean()
  const password = passwordEnabled
    ? faker.internet.password({ length: 8 })
    : undefined

  return {
    server: faker.helpers.arrayElement(servers),
    name: faker.internet.username(),
    passwordEnabled,
    password,
    macAddress: faker.datatype.boolean() ? faker.internet.mac() : undefined,
    profile: faker.helpers.arrayElement(profiles),
    timeLimit: faker.datatype.boolean()
      ? `${faker.number.int({ min: 1, max: 12 })}h`
      : undefined,
    dataLimit: faker.datatype.boolean()
      ? `${faker.number.int({ min: 100, max: 5000 })}MB`
      : undefined,
    comment: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    uptime: faker.datatype.boolean()
      ? `${faker.number.int({ min: 1, max: 48 })}h`
      : undefined,
    bytesIn: faker.datatype.boolean()
      ? `${faker.number.int({ min: 10_000, max: 5_000_000 })}`
      : undefined,
    bytesOut: faker.datatype.boolean()
      ? `${faker.number.int({ min: 10_000, max: 5_000_000 })}`
      : undefined,
    limitUptime: faker.datatype.boolean()
      ? `${faker.number.int({ min: 1, max: 24 })}h`
      : undefined,
    limitBytesTotal: faker.datatype.boolean()
      ? `${faker.number.int({ min: 100, max: 10_000 })}MB`
      : undefined,
    userCode: faker.datatype.boolean()
      ? faker.string.alphanumeric(10).toUpperCase()
      : undefined,
    expireDate: faker.datatype.boolean()
      ? faker.date.future().toISOString().split('T')[0]
      : undefined,
  }
})
