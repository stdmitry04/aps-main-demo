/**
 * Case transformation utilities for API data
 *
 * Converts between snake_case (backend) and camelCase (frontend)
 */

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Recursively transform object keys from snake_case to camelCase
 */
export function transformKeysToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamel) as any
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        transformed[snakeToCamel(key)] = transformKeysToCamel(obj[key])
      }
    }
    return transformed
  }

  return obj
}

/**
 * Recursively transform object keys from camelCase to snake_case
 */
export function transformKeysToSnake<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnake) as any
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        transformed[camelToSnake(key)] = transformKeysToSnake(obj[key])
      }
    }
    return transformed
  }

  return obj
}
