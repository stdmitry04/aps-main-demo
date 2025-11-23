/**
 * Tests for useTimecard hook
 *
 * Test Coverage:
 * - Loading current timecard on mount
 * - Loading active time entry on mount
 * - Clock in functionality with geolocation
 * - Clock out functionality
 * - Creating timecards
 * - Submitting timecards
 * - Automatic timecard creation
 * - Error handling
 * - Loading states
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTimecard } from '../../app/(modules)/timeandattendance/hooks/useTimesheet'
import { timecardApi } from '../../app/(modules)/timeandattendance/hooks/currentTimesheet'

// Mock the timecard API
vi.mock('../../app/(modules)/timeandattendance/hooks/currentTimesheet', () => ({
  timecardApi: {
    getCurrentTimecard: vi.fn(),
    getActiveTimeEntry: vi.fn(),
    createTimecard: vi.fn(),
    submitTimecard: vi.fn(),
    clockIn: vi.fn(),
    clockOut: vi.fn(),
  },
}))

describe('useTimecard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial data loading', () => {
    it('should load current timecard and active entry on mount', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
        totalHours: 40,
      }
      const mockActiveEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: null,
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(mockTimecard as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(mockActiveEntry as any)

      const { result } = renderHook(() => useTimecard())

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.currentTimecard).toEqual(mockTimecard)
      expect(result.current.activeEntry).toEqual(mockActiveEntry)
      expect(result.current.error).toBeNull()
      expect(timecardApi.getCurrentTimecard).toHaveBeenCalledTimes(1)
      expect(timecardApi.getActiveTimeEntry).toHaveBeenCalledTimes(1)
    })

    it('should handle no active timecard gracefully', async () => {
      vi.mocked(timecardApi.getCurrentTimecard).mockRejectedValue(new Error('No active timecard'))
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.currentTimecard).toBeNull()
      expect(result.current.activeEntry).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should handle no active entry gracefully', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(mockTimecard as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockRejectedValue(new Error('No active entry'))

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.currentTimecard).toEqual(mockTimecard)
      expect(result.current.activeEntry).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('clockIn', () => {
    it('should clock in without geolocation data', async () => {
      const mockEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: null,
      }

      // Mock initial load
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.clockIn).mockResolvedValue(mockEntry as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock the reload after clock in
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(mockEntry as any)

      let entry
      await act(async () => {
        entry = await result.current.clockIn()
      })

      await waitFor(() => {
        expect(result.current.activeEntry).toEqual(mockEntry)
      })

      expect(entry).toEqual(mockEntry)
      expect(timecardApi.clockIn).toHaveBeenCalledWith(undefined)
    })

    it('should clock in with geolocation data', async () => {
      const mockEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: null,
        geoVerified: true,
        latitude: 40.7128,
        longitude: -74.0060,
      }

      const geoData = {
        geoVerified: true,
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
      }

      // Mock initial load
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.clockIn).mockResolvedValue(mockEntry as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock the reload after clock in
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(mockEntry as any)

      let entry
      await act(async () => {
        entry = await result.current.clockIn(geoData)
      })

      await waitFor(() => {
        expect(result.current.activeEntry).toEqual(mockEntry)
      })

      expect(entry).toEqual(mockEntry)
      expect(timecardApi.clockIn).toHaveBeenCalledWith(geoData)
    })

    it('should handle clock in errors', async () => {
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.clockIn).mockRejectedValue(new Error('Clock in failed'))

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.clockIn()).rejects.toThrow('Clock in failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Clock in failed')
      })
    })
  })

  describe('clockOut', () => {
    it('should clock out successfully', async () => {
      const mockActiveEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: null,
      }

      const mockCompletedEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: '2025-11-10T17:00:00Z',
      }

      // Mock initial load with active entry
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(mockActiveEntry as any)
      vi.mocked(timecardApi.clockOut).mockResolvedValue(mockCompletedEntry as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.activeEntry).toEqual(mockActiveEntry)
      })

      // Mock the reload after clock out (no active entry)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)

      let entry
      await act(async () => {
        entry = await result.current.clockOut()
      })

      await waitFor(() => {
        expect(result.current.activeEntry).toBeNull()
      })

      expect(entry).toEqual(mockCompletedEntry)
      expect(timecardApi.clockOut).toHaveBeenCalledTimes(1)
    })

    it('should handle clock out errors', async () => {
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.clockOut).mockRejectedValue(new Error('Clock out failed'))

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.clockOut()).rejects.toThrow('Clock out failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Clock out failed')
      })
    })
  })

  describe('handleClockToggle', () => {
    it('should clock out when entry is active', async () => {
      const mockActiveEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: null,
      }

      const mockCompletedEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: '2025-11-10T17:00:00Z',
      }

      // Mock initial load with active entry
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(mockActiveEntry as any)
      vi.mocked(timecardApi.clockOut).mockResolvedValue(mockCompletedEntry as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.activeEntry).toEqual(mockActiveEntry)
      })

      // Mock the reload after clock out
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)

      await act(async () => {
        await result.current.handleClockToggle()
      })

      await waitFor(() => {
        expect(result.current.activeEntry).toBeNull()
      })

      expect(timecardApi.clockOut).toHaveBeenCalledTimes(1)
      expect(timecardApi.clockIn).not.toHaveBeenCalled()
    })

    it('should clock in when no entry is active', async () => {
      const mockEntry = {
        id: 1,
        clockIn: '2025-11-10T09:00:00Z',
        clockOut: null,
      }

      // Mock initial load with no active entry
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.clockIn).mockResolvedValue(mockEntry as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.activeEntry).toBeNull()
      })

      // Mock the reload after clock in
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(mockEntry as any)

      await act(async () => {
        await result.current.handleClockToggle()
      })

      await waitFor(() => {
        expect(result.current.activeEntry).toEqual(mockEntry)
      })

      expect(timecardApi.clockIn).toHaveBeenCalledTimes(1)
      expect(timecardApi.clockOut).not.toHaveBeenCalled()
    })
  })

  describe('createTimecard', () => {
    it('should create a new timecard', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.createTimecard).mockResolvedValue(mockTimecard as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let timecard
      await act(async () => {
        timecard = await result.current.createTimecard('2025-11-04', '2025-11-10')
      })

      expect(timecard).toEqual(mockTimecard)
      expect(result.current.currentTimecard).toEqual(mockTimecard)
      expect(timecardApi.createTimecard).toHaveBeenCalledWith('2025-11-04', '2025-11-10')
    })

    it('should handle create timecard errors', async () => {
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.createTimecard).mockRejectedValue(new Error('Create failed'))

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.createTimecard('2025-11-04', '2025-11-10')).rejects.toThrow('Create failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Create failed')
      })
    })
  })

  describe('createTimecardIfNeeded', () => {
    it('should create timecard when none exists', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.createTimecard).mockResolvedValue(mockTimecard as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let timecard
      await act(async () => {
        timecard = await result.current.createTimecardIfNeeded()
      })

      expect(timecard).toEqual(mockTimecard)
      expect(result.current.currentTimecard).toEqual(mockTimecard)
      expect(timecardApi.createTimecard).toHaveBeenCalledTimes(1)
    })

    it('should not create timecard if one already exists', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(mockTimecard as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.currentTimecard).toEqual(mockTimecard)
      })

      await act(async () => {
        await result.current.createTimecardIfNeeded()
      })

      // createTimecard should not be called since timecard already exists
      expect(timecardApi.createTimecard).not.toHaveBeenCalled()
    })

    it('should not retry creation after failed attempt', async () => {
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.createTimecard).mockRejectedValue(new Error('Create failed'))

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // First attempt should call createTimecard
      await act(async () => {
        await result.current.createTimecardIfNeeded()
      })

      await waitFor(() => {
        expect(timecardApi.createTimecard).toHaveBeenCalledTimes(1)
      })

      // Second attempt should not call createTimecard again
      await act(async () => {
        await result.current.createTimecardIfNeeded()
      })

      expect(timecardApi.createTimecard).toHaveBeenCalledTimes(1)
    })
  })

  describe('submitTimecard', () => {
    it('should submit timecard without overtime reason', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
      }

      const mockSubmittedTimecard = {
        ...mockTimecard,
        status: 'submitted',
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(mockTimecard as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.submitTimecard).mockResolvedValue(mockSubmittedTimecard as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.currentTimecard).toEqual(mockTimecard)
      })

      let submitted
      await act(async () => {
        submitted = await result.current.submitTimecard()
      })

      expect(submitted).toEqual(mockSubmittedTimecard)
      expect(result.current.currentTimecard).toEqual(mockSubmittedTimecard)
      expect(timecardApi.submitTimecard).toHaveBeenCalledWith(1, undefined)
    })

    it('should submit timecard with overtime reason', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
      }

      const mockSubmittedTimecard = {
        ...mockTimecard,
        status: 'submitted',
        overtimeReason: 'Extra project work',
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(mockTimecard as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.submitTimecard).mockResolvedValue(mockSubmittedTimecard as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.currentTimecard).toEqual(mockTimecard)
      })

      let submitted
      await act(async () => {
        submitted = await result.current.submitTimecard({ overtimeReason: 'Extra project work' })
      })

      expect(submitted).toEqual(mockSubmittedTimecard)
      expect(timecardApi.submitTimecard).toHaveBeenCalledWith(1, { overtimeReason: 'Extra project work' })
    })

    it('should not submit if no timecard exists', async () => {
      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(null as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.currentTimecard).toBeNull()
      })

      let submitted
      await act(async () => {
        submitted = await result.current.submitTimecard()
      })

      expect(submitted).toBeUndefined()
      expect(timecardApi.submitTimecard).not.toHaveBeenCalled()
    })

    it('should handle submit errors', async () => {
      const mockTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
      }

      vi.mocked(timecardApi.getCurrentTimecard).mockResolvedValue(mockTimecard as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)
      vi.mocked(timecardApi.submitTimecard).mockRejectedValue(new Error('Submit failed'))

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.currentTimecard).toEqual(mockTimecard)
      })

      await act(async () => {
        await expect(result.current.submitTimecard()).rejects.toThrow('Submit failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Submit failed')
      })
    })
  })

  describe('refresh', () => {
    it('should manually refresh timecard data', async () => {
      const initialTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
        totalHours: 20,
      }

      const updatedTimecard = {
        id: 1,
        periodStart: '2025-11-04',
        periodEnd: '2025-11-10',
        status: 'active',
        totalHours: 40,
      }

      vi.mocked(timecardApi.getCurrentTimecard)
        .mockResolvedValueOnce(initialTimecard as any)
        .mockResolvedValueOnce(updatedTimecard as any)
      vi.mocked(timecardApi.getActiveTimeEntry).mockResolvedValue(null as any)

      const { result } = renderHook(() => useTimecard())

      await waitFor(() => {
        expect(result.current.currentTimecard).toEqual(initialTimecard)
      })

      // Manually refresh
      await act(async () => {
        await result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.currentTimecard).toEqual(updatedTimecard)
      })

      expect(timecardApi.getCurrentTimecard).toHaveBeenCalledTimes(2)
    })
  })
})
