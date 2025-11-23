/**
 * Tests for useMyTimesheets and useTimesheetReview hooks
 *
 * Test Coverage:
 * - useMyTimesheets:
 *   - Fetching user's timesheets
 *   - Filtering out future timesheets
 *   - Submitting timesheets
 *   - Refreshing timesheet data
 *   - Error handling
 * - useTimesheetReview:
 *   - Fetching pending timesheets
 *   - Approving timesheets
 *   - Rejecting timesheets with feedback
 *   - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useMyTimesheets, useTimesheetReview } from '../../app/(modules)/timeandattendance/hooks/useTimesheetManagement'
import { taApi } from '../../app/(modules)/timeandattendance/hooks/timeAttendance'
import { timecardApi } from '../../app/(modules)/timeandattendance/hooks/currentTimesheet'

// Mock the APIs
vi.mock('../../app/(modules)/timeandattendance/hooks/timeAttendance', () => ({
  taApi: {
    getMyTimesheets: vi.fn(),
    getSubmittedTimesheets: vi.fn(),
    approveTimesheet: vi.fn(),
  },
}))

vi.mock('../../app/(modules)/timeandattendance/hooks/currentTimesheet', () => ({
  timecardApi: {
    submitTimecard: vi.fn(),
  },
}))

// Mock the utility function
vi.mock('../review/utils', () => ({
  mapApiTimesheetToUiTimesheet: (timesheet: any) => ({
    ...timesheet,
    // Simple pass-through for testing
    weekEnding: timesheet.periodEnd || timesheet.weekEnding,
  }),
}))

describe('useMyTimesheets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock current date to 2025-11-10 (Sunday)
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2025-11-10T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('fetchTimesheets', () => {
    it('should fetch and filter timesheets on mount', async () => {
      const mockApiTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'draft',
          totalHours: 40,
        },
        {
          id: 2,
          periodStart: '2025-10-28',
          periodEnd: '2025-11-03',
          status: 'submitted',
          totalHours: 40,
        },
      ]

      vi.mocked(taApi.getMyTimesheets).mockResolvedValue(mockApiTimesheets)

      const { result } = renderHook(() => useMyTimesheets())

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.timesheets).toHaveLength(2)
      expect(result.current.error).toBeNull()
      expect(taApi.getMyTimesheets).toHaveBeenCalledTimes(1)
    })

    it('should filter out future timesheets', async () => {
      const mockApiTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10', // Current week (should be included)
          status: 'draft',
        },
        {
          id: 2,
          periodStart: '2025-11-11',
          periodEnd: '2025-11-17', // Future week (should be excluded)
          status: 'draft',
        },
      ]

      vi.mocked(taApi.getMyTimesheets).mockResolvedValue(mockApiTimesheets)

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Only the current week should be included
      expect(result.current.timesheets).toHaveLength(1)
      expect(result.current.timesheets[0].id).toBe(1)
    })

    it('should include current week even if incomplete', async () => {
      // Set current date to middle of the week (Wednesday)
      vi.setSystemTime(new Date('2025-11-05T12:00:00Z'))

      const mockApiTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-03',
          periodEnd: '2025-11-09', // Current week, not yet ended
          status: 'draft',
        },
      ]

      vi.mocked(taApi.getMyTimesheets).mockResolvedValue(mockApiTimesheets)

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Current week should be included even though it hasn't ended
      expect(result.current.timesheets).toHaveLength(1)
    })

    it('should handle empty results', async () => {
      vi.mocked(taApi.getMyTimesheets).mockResolvedValue([])

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.timesheets).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to fetch timesheets'
      vi.mocked(taApi.getMyTimesheets).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.timesheets).toEqual([])
    })
  })

  describe('submitTimesheet', () => {
    it('should submit timesheet without overtime reason', async () => {
      const mockTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'draft',
        },
      ]

      const mockSubmittedTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getMyTimesheets)
        .mockResolvedValueOnce(mockTimesheets)
        .mockResolvedValueOnce(mockSubmittedTimesheets)
      vi.mocked(timecardApi.submitTimecard).mockResolvedValue({} as any)

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.submitTimesheet(1)
      })

      await waitFor(() => {
        expect(result.current.timesheets[0].status).toBe('submitted')
      })

      expect(timecardApi.submitTimecard).toHaveBeenCalledWith(1, undefined)
    })

    it('should submit timesheet with overtime reason', async () => {
      const mockTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'draft',
        },
      ]

      vi.mocked(taApi.getMyTimesheets).mockResolvedValue(mockTimesheets)
      vi.mocked(timecardApi.submitTimecard).mockResolvedValue({} as any)

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.submitTimesheet(1, 'Project deadline')
      })

      expect(timecardApi.submitTimecard).toHaveBeenCalledWith(1, { overtimeReason: 'Project deadline' })
    })

    it('should handle submit errors', async () => {
      const mockTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'draft',
        },
      ]

      vi.mocked(taApi.getMyTimesheets).mockResolvedValue(mockTimesheets)
      vi.mocked(timecardApi.submitTimecard).mockRejectedValue(new Error('Submit failed'))

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.submitTimesheet(1)).rejects.toThrow('Submit failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Submit failed')
      })
    })

    it('should refresh timesheets after successful submission', async () => {
      const mockInitialTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'draft',
        },
      ]

      const mockUpdatedTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getMyTimesheets)
        .mockResolvedValueOnce(mockInitialTimesheets)
        .mockResolvedValueOnce(mockUpdatedTimesheets)
      vi.mocked(timecardApi.submitTimecard).mockResolvedValue({} as any)

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.timesheets[0].status).toBe('draft')
      })

      await act(async () => {
        await result.current.submitTimesheet(1)
      })

      await waitFor(() => {
        expect(result.current.timesheets[0].status).toBe('submitted')
      })

      expect(taApi.getMyTimesheets).toHaveBeenCalledTimes(2)
    })
  })

  describe('refresh', () => {
    it('should manually refresh timesheets', async () => {
      const initialTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'draft',
        },
      ]

      const refreshedTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'draft',
        },
        {
          id: 2,
          periodStart: '2025-10-28',
          periodEnd: '2025-11-03',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getMyTimesheets)
        .mockResolvedValueOnce(initialTimesheets)
        .mockResolvedValueOnce(refreshedTimesheets)

      const { result } = renderHook(() => useMyTimesheets())

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(1)
      })

      await act(async () => {
        await result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(2)
      })

      expect(taApi.getMyTimesheets).toHaveBeenCalledTimes(2)
    })
  })
})

describe('useTimesheetReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchPendingTimesheets', () => {
    it('should fetch pending timesheets on mount', async () => {
      const mockTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
          employeeName: 'John Doe',
        },
        {
          id: 2,
          periodStart: '2025-10-28',
          periodEnd: '2025-11-03',
          status: 'submitted',
          employeeName: 'Jane Smith',
        },
      ]

      vi.mocked(taApi.getSubmittedTimesheets).mockResolvedValue(mockTimesheets)

      const { result } = renderHook(() => useTimesheetReview())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.timesheets).toHaveLength(2)
      expect(result.current.error).toBeNull()
      expect(taApi.getSubmittedTimesheets).toHaveBeenCalledTimes(1)
    })

    it('should handle empty results', async () => {
      vi.mocked(taApi.getSubmittedTimesheets).mockResolvedValue([])

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.timesheets).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to load pending timesheets'
      vi.mocked(taApi.getSubmittedTimesheets).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.timesheets).toEqual([])
    })
  })

  describe('approveTimesheet', () => {
    it('should approve a timesheet', async () => {
      const mockPendingTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
        {
          id: 2,
          periodStart: '2025-10-28',
          periodEnd: '2025-11-03',
          status: 'submitted',
        },
      ]

      const mockUpdatedTimesheets = [
        {
          id: 2,
          periodStart: '2025-10-28',
          periodEnd: '2025-11-03',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getSubmittedTimesheets)
        .mockResolvedValueOnce(mockPendingTimesheets)
        .mockResolvedValueOnce(mockUpdatedTimesheets)
      vi.mocked(taApi.approveTimesheet).mockResolvedValue({} as any)

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(2)
      })

      await act(async () => {
        await result.current.approveTimesheet(1)
      })

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(1)
      })

      expect(taApi.approveTimesheet).toHaveBeenCalledWith(1, { action: 'approve' })
      expect(taApi.getSubmittedTimesheets).toHaveBeenCalledTimes(2)
    })

    it('should handle approve errors', async () => {
      const mockTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getSubmittedTimesheets).mockResolvedValue(mockTimesheets)
      vi.mocked(taApi.approveTimesheet).mockRejectedValue(new Error('Approve failed'))

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.approveTimesheet(1)).rejects.toThrow('Approve failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Approve failed')
      })
    })
  })

  describe('rejectTimesheet', () => {
    it('should reject a timesheet with feedback', async () => {
      const mockPendingTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getSubmittedTimesheets)
        .mockResolvedValueOnce(mockPendingTimesheets)
        .mockResolvedValueOnce([])
      vi.mocked(taApi.approveTimesheet).mockResolvedValue({} as any)

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(1)
      })

      await act(async () => {
        await result.current.rejectTimesheet(1, 'Missing clock out times')
      })

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(0)
      })

      expect(taApi.approveTimesheet).toHaveBeenCalledWith(1, {
        action: 'reject',
        feedback: 'Missing clock out times',
        reasons: undefined,
      })
    })

    it('should reject a timesheet with reasons', async () => {
      const mockTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getSubmittedTimesheets)
        .mockResolvedValueOnce(mockTimesheets)
        .mockResolvedValueOnce([])
      vi.mocked(taApi.approveTimesheet).mockResolvedValue({} as any)

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.rejectTimesheet(1, 'Please correct the following', ['Missing hours', 'Invalid dates'])
      })

      expect(taApi.approveTimesheet).toHaveBeenCalledWith(1, {
        action: 'reject',
        feedback: 'Please correct the following',
        reasons: ['Missing hours', 'Invalid dates'],
      })
    })

    it('should handle reject errors', async () => {
      const mockTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getSubmittedTimesheets).mockResolvedValue(mockTimesheets)
      vi.mocked(taApi.approveTimesheet).mockRejectedValue(new Error('Reject failed'))

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(result.current.rejectTimesheet(1, 'Feedback')).rejects.toThrow('Reject failed')
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Reject failed')
      })
    })
  })

  describe('refresh', () => {
    it('should manually refresh pending timesheets', async () => {
      const initialTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
      ]

      const refreshedTimesheets = [
        {
          id: 1,
          periodStart: '2025-11-04',
          periodEnd: '2025-11-10',
          status: 'submitted',
        },
        {
          id: 2,
          periodStart: '2025-10-28',
          periodEnd: '2025-11-03',
          status: 'submitted',
        },
      ]

      vi.mocked(taApi.getSubmittedTimesheets)
        .mockResolvedValueOnce(initialTimesheets)
        .mockResolvedValueOnce(refreshedTimesheets)

      const { result } = renderHook(() => useTimesheetReview())

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(1)
      })

      await act(async () => {
        await result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.timesheets).toHaveLength(2)
      })

      expect(taApi.getSubmittedTimesheets).toHaveBeenCalledTimes(2)
    })
  })
})
