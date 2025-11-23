/**
 * Tests for useEvents hook
 *
 * Test Coverage:
 * - Event fetching and state management
 * - Creating new events
 * - Updating existing events
 * - Deleting events (soft delete)
 * - Error handling
 * - Loading states
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useEvents } from '../../app/(modules)/timeandattendance/hooks/useEvents'
import { eventsApi } from '../../app/(modules)/timeandattendance/hooks/events'

// Mock the events API
vi.mock('../../app/(modules)/timeandattendance/hooks/events', () => ({
  eventsApi: {
    getEvents: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    getPendingRequests: vi.fn(),
    updateRequestStatus: vi.fn(),
  },
}))

describe('useEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchEvents', () => {
    it('should fetch events on mount', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1', date: '2025-11-15', time: '10:00 AM', type: 'scheduled' as const },
        { id: 2, title: 'Event 2', date: '2025-11-16', time: '2:00 PM', type: 'approved' as const },
      ]

      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: mockEvents })

      const { result } = renderHook(() => useEvents())

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.events).toEqual(mockEvents)
      expect(result.current.error).toBeNull()
      expect(eventsApi.getEvents).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to fetch events'
      vi.mocked(eventsApi.getEvents).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.events).toEqual([])
    })

    it('should handle empty results', async () => {
      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: [] })

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.events).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const mockEvents = [
        { id: 1, title: 'Existing Event', date: '2025-11-15', time: '10:00 AM', type: 'scheduled' as const },
      ]
      const newEvent = {
        id: 2,
        title: 'New Event',
        date: '2025-11-20',
        time: '3:00 PM',
        type: 'scheduled' as const,
        description: 'New event description',
        request: 'none' as const,
        active: true,
      }

      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: mockEvents })
      vi.mocked(eventsApi.createEvent).mockResolvedValue(newEvent)

      const { result } = renderHook(() => useEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Create new event
      const createdEvent = await result.current.createEvent({
        title: 'New Event',
        date: '2025-11-20',
        time: '3:00 PM',
        type: 'scheduled',
        description: 'New event description',
        request: 'none',
        active: true,
      })

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.events).toHaveLength(2)
      })

      expect(createdEvent).toEqual(newEvent)
      expect(result.current.events[1]).toEqual(newEvent)
      expect(eventsApi.createEvent).toHaveBeenCalledWith({
        title: 'New Event',
        date: '2025-11-20',
        time: '3:00 PM',
        type: 'scheduled',
        description: 'New event description',
        request: 'none',
        active: true,
      })
    })

    it('should handle create errors', async () => {
      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: [] })
      vi.mocked(eventsApi.createEvent).mockRejectedValue(new Error('Create failed'))

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call createEvent and catch the error
      try {
        await result.current.createEvent({
          title: 'New Event',
          date: '2025-11-20',
          time: '3:00 PM',
          type: 'scheduled',
          active: true,
        })
      } catch (error) {
        // Error is expected
      }

      // Wait for error state to update after the failed call
      await waitFor(() => {
        expect(result.current.error).toBe('Create failed')
      })
    })
  })

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const originalEvent = {
        id: 1,
        title: 'Original Title',
        date: '2025-11-15',
        time: '10:00 AM',
        type: 'scheduled' as const,
      }
      const updatedEvent = {
        ...originalEvent,
        title: 'Updated Title',
        time: '11:00 AM',
      }

      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: [originalEvent] })
      vi.mocked(eventsApi.updateEvent).mockResolvedValue(updatedEvent)

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const updated = await result.current.updateEvent(1, {
        title: 'Updated Title',
        time: '11:00 AM',
      })

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.events[0]).toEqual(updatedEvent)
      })

      expect(updated).toEqual(updatedEvent)
      expect(eventsApi.updateEvent).toHaveBeenCalledWith(1, {
        title: 'Updated Title',
        time: '11:00 AM',
      })
    })

    it('should handle update errors', async () => {
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        date: '2025-11-15',
        time: '10:00 AM',
        type: 'scheduled' as const,
      }

      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: [mockEvent] })
      vi.mocked(eventsApi.updateEvent).mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call updateEvent and catch the error
      try {
        await result.current.updateEvent(1, { title: 'New Title' })
      } catch (error) {
        // Error is expected
      }

      // Wait for error state to update after the failed call
      await waitFor(() => {
        expect(result.current.error).toBe('Update failed')
      })
    })
  })

  describe('deleteEvent', () => {
    it('should soft delete an event', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1', date: '2025-11-15', time: '10:00 AM', type: 'scheduled' as const },
        { id: 2, title: 'Event 2', date: '2025-11-16', time: '2:00 PM', type: 'scheduled' as const },
      ]

      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: mockEvents })
      vi.mocked(eventsApi.deleteEvent).mockResolvedValue(undefined as any)

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.events).toHaveLength(2)

      await result.current.deleteEvent(1)

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.events).toHaveLength(1)
      })

      expect(result.current.events[0].id).toBe(2)
      expect(eventsApi.deleteEvent).toHaveBeenCalledWith(1)
    })

    it('should handle delete errors', async () => {
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        date: '2025-11-15',
        time: '10:00 AM',
        type: 'scheduled' as const,
      }

      vi.mocked(eventsApi.getEvents).mockResolvedValue({ results: [mockEvent] })
      vi.mocked(eventsApi.deleteEvent).mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call deleteEvent and catch the error
      try {
        await result.current.deleteEvent(1)
      } catch (error) {
        // Error is expected
      }

      // Wait for error state to update after the failed call
      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed')
      })

      // Event should still be in the list
      expect(result.current.events).toHaveLength(1)
    })
  })

  describe('refresh', () => {
    it('should manually refresh events', async () => {
      const initialEvents = [
        { id: 1, title: 'Event 1', date: '2025-11-15', time: '10:00 AM', type: 'scheduled' as const },
      ]
      const refreshedEvents = [
        { id: 1, title: 'Event 1', date: '2025-11-15', time: '10:00 AM', type: 'scheduled' as const },
        { id: 2, title: 'Event 2', date: '2025-11-16', time: '2:00 PM', type: 'scheduled' as const },
      ]

      vi.mocked(eventsApi.getEvents)
        .mockResolvedValueOnce({ results: initialEvents })
        .mockResolvedValueOnce({ results: refreshedEvents })

      const { result } = renderHook(() => useEvents())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.events).toHaveLength(1)

      // Manually refresh
      await result.current.refresh()

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.events).toHaveLength(2)
      })
      expect(eventsApi.getEvents).toHaveBeenCalledTimes(2)
    })
  })

  describe('loading states', () => {
    it('should set loading state during operations', async () => {
      vi.mocked(eventsApi.getEvents).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ results: [] }), 100))
      )

      const { result } = renderHook(() => useEvents())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
