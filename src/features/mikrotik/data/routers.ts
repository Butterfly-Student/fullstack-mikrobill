import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(67890)

export const routers = Array.from({ length: 500 }, () => {
  const routerBrand = faker.helpers.arrayElement([
    'MikroTik',
    'Cisco',
    'TP-Link',
    'Ubiquiti',
    'ASUS',
  ])
  const routerModel = faker.helpers.arrayElement([
    'RB4011',
    'RB2011',
    'hEX',
    'CRS328',
    'CCR1036',
  ])

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    uuid: faker.string.uuid(),
    name: `${routerBrand}-${routerModel}-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    hostname: faker.internet.ipv4(),
    username: faker.helpers.arrayElement([
      'admin',
      'administrator',
      'root',
      'mikrotik',
    ]),
    password: faker.internet.password({ length: 12 }),
    keepalive: faker.helpers.arrayElement([true, false]),
    timeout: faker.helpers.arrayElement([30000, 60000, 120000, 300000, 600000]), // dalam milliseconds
    port: faker.helpers.arrayElement([8728, 8729, 22, 23, 80, 443]), // common router ports
    location: `${faker.location.city()}, ${faker.location.state()}`,
    description: faker.helpers.arrayElement([
      'Main gateway router for office network',
      'Branch office router - backup connection',
      'WiFi access point and router',
      'Core network router - high availability',
      'Edge router for internet connection',
      'Distribution router for VLAN management',
      'Backup router for failover connection',
    ]),
    is_active: faker.helpers.arrayElement([true, false]),
    last_seen: faker.date.recent({ days: 7 }),
    status: faker.helpers.arrayElement(['online', 'offline', 'error']),
    version: faker.helpers.arrayElement([
      'RouterOS 7.13.3',
      'RouterOS 7.12.1',
      'RouterOS 6.49.10',
      'IOS 15.4(3)S',
      'OpenWrt 23.05.2',
    ]),
    uptime: faker.helpers.arrayElement([
      '15d 4h 32m',
      '2d 18h 45m',
      '45d 12h 8m',
      '1h 23m',
      '128d 7h 15m',
      '3d 2h 55m',
    ]),
    created_at: faker.date.past({ years: 2 }),
    updated_at: faker.date.recent({ days: 30 }),
  }
})
