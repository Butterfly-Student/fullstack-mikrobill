import { faker } from '@faker-js/faker'
import { type PppoeUser } from './schema'

const secrets: PppoeUser[] = Array.from(
  { length: faker.number.int({ min: 3, max: 10 }) },
  () => ({
    '.id': faker.string.uuid(),
    name: faker.internet.username(),
    service: faker.helpers.arrayElement([
      'pppoe',
      'pptp',
      'l2tp',
      'ovpn',
      'sstp',
    ]),
    'caller-id': faker.internet.mac(), // atau faker.phone.number()
    password: faker.internet.password(),
    profile: faker.word.noun(),
    routes: faker.internet.ip(),
    'ipv6-routes': faker.internet.ipv6(),
    'limit-bytes-in': faker.number.int({ min: 1000, max: 1000000 }).toString(),
    'limit-bytes-out': faker.number.int({ min: 1000, max: 1000000 }).toString(),
    'last-logged-out': faker.date.recent().toISOString(),
    disabled: faker.datatype.boolean(),
    'local-address': faker.internet.ip(),
    'remote-address': faker.internet.ip(),
    'remote-ipv6-prefix': faker.internet.ipv6(),
  })
)

export default secrets
