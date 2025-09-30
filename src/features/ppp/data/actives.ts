import { faker } from '@faker-js/faker'
import { type PppoeActive } from './schema'

const actives: PppoeActive[] = Array.from(
  { length: faker.number.int({ min: 3, max: 10 }) },
  () => ({
    '.id': faker.string.uuid(),
    name: faker.internet.userName(),
    'caller-id': faker.internet.mac(), // atau faker.phone.number()
    address: faker.internet.ip(),
    uptime: `${faker.number.int({ min: 1, max: 48 })}h${faker.number.int({ min: 0, max: 59 })}m`,
    encoding: faker.helpers.arrayElement(['MPPE', 'MSCHAPv2', 'PAP', 'CHAP']),
    packets: `${faker.number.int({ min: 1000, max: 100000 })}/${faker.number.int({ min: 1000, max: 100000 })}`,
    'session-id': faker.string.alphanumeric(12),
    'limit-bytes-in': faker.number.int({ min: 1000, max: 10000000 }).toString(),
    'limit-bytes-out': faker.number
      .int({ min: 1000, max: 10000000 })
      .toString(),
    service: faker.helpers.arrayElement([
      'async',
      'isdn',
      'l2tp',
      'pppoe',
      'pptp',
      'ovpn',
      'sstp',
    ]),
  })
)

export default actives
