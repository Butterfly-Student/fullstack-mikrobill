// parser-utils.ts
/**
 * Parse on-login script untuk ekstrak konfigurasi dari :put statement
 * Format: :put (",ntfc,0,2m,0,,Enable,Enable,")
 */
export function parseOnLoginScript(script: string): {
  expMode?: 'ntf' | 'ntfc' | 'rem' | 'remc' | '0'
  price?: string
  validity?: string
  sellingPrice?: string
  lockUser?: 'Enable' | 'Disable'
  lockServer?: 'Enable' | 'Disable'
} {
  if (!script) return {}

  const config: {
    expMode?: 'ntf' | 'ntfc' | 'rem' | 'remc' | '0'
    price?: string
    validity?: string
    sellingPrice?: string
    lockUser?: 'Enable' | 'Disable'
    lockServer?: 'Enable' | 'Disable'
  } = {}

  // Cari :put statement dengan regex
  const putMatch = script.match(/:put\s*\(\s*[",]\s*([^"]+)\s*["]\s*\)/)

  if (putMatch && putMatch[1]) {
    // Split by comma untuk mendapatkan nilai-nilai
    const values = putMatch[1].split(',')

    // Mapping berdasarkan format:
    // Index 0: expMode
    // Index 1: price
    // Index 2: validity
    // Index 3: sellingPrice
    // Index 4: (kosong - reserved)
    // Index 5: lockUser
    // Index 6: lockServer

    if (values.length >= 7) {
      // expMode
      const expMode = values[0]?.trim()
      if (expMode && ['ntf', 'ntfc', 'rem', 'remc', '0'].includes(expMode)) {
        config.expMode = expMode as 'ntf' | 'ntfc' | 'rem' | 'remc' | '0'
      }

      // price
      const price = values[1]?.trim()
      if (price) {
        config.price = price
      }

      // validity
      const validity = values[2]?.trim()
      if (validity) {
        config.validity = validity
      }

      // sellingPrice
      const sellingPrice = values[3]?.trim()
      if (sellingPrice) {
        config.sellingPrice = sellingPrice
      }

      // lockUser
      const lockUser = values[5]?.trim()
      if (lockUser && ['Enable', 'Disable'].includes(lockUser)) {
        config.lockUser = lockUser as 'Enable' | 'Disable'
      }

      // lockServer
      const lockServer = values[6]?.trim()
      if (lockServer && ['Enable', 'Disable'].includes(lockServer)) {
        config.lockServer = lockServer as 'Enable' | 'Disable'
      }
    }
  }

  return config
}
