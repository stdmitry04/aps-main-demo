/**
 * Test utilities for rendering components with providers and creating test data
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Mock event data factory
 */
export const createMockEvent = (overrides = {}) => ({
  id: 1,
  title: 'Test Event',
  date: '2025-11-15',
  time: '10:00 AM',
  type: 'scheduled' as const,
  description: 'Test description',
  request: 'none' as const,
  active: true,
  ...overrides,
})

/**
 * Mock multiple events
 */
export const createMockEvents = (count: number) => {
  return Array.from({ length: count }, (_, i) => createMockEvent({
    id: i + 1,
    title: `Event ${i + 1}`,
    date: `2025-11-${String(15 + i).padStart(2, '0')}`,
  }))
}

/**
 * Mock API response factory
 */
export const createMockApiResponse = <T,>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
})

/**
 * Mock API error factory
 */
export const createMockApiError = (message: string, status = 400) => ({
  response: {
    data: { message },
    status,
    statusText: 'Bad Request',
    headers: {},
    config: {} as any,
  },
  message,
  name: 'AxiosError',
  config: {} as any,
  isAxiosError: true,
  toJSON: () => ({}),
})

/**
 * Wait for a condition to be true
 */
export const waitFor = (condition: () => boolean, timeout = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve()
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval)
        reject(new Error('Timeout waiting for condition'))
      }
    }, 50)
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
