/**
 * Tests for useGeolocation hook and geolocation utilities
 *
 * Test Coverage:
 * - useGeolocation hook:
 *   - Successful geolocation retrieval
 *   - Geofence verification
 *   - Permission denied errors
 *   - Position unavailable errors
 *   - Timeout errors
 *   - Browser support detection
 * - Utility functions:
 *   - calculateDistance (Haversine formula)
 *   - isWithinGeofence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGeolocation, calculateDistance, isWithinGeofence } from '../../app/(modules)/timeandattendance/hooks/useGeolocation'

describe('useGeolocation', () => {
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Mock navigator.geolocation
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    }

    Object.defineProperty(global.navigator, 'geolocation', {
      writable: true,
      value: mockGeolocation,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('successful geolocation', () => {
    it('should retrieve geolocation successfully', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const { result } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.latitude).toBe(40.7128)
      expect(result.current.longitude).toBe(-74.0060)
      expect(result.current.accuracy).toBe(10)
      expect(result.current.error).toBeNull()
      expect(result.current.verified).toBe(false)
    })

    it('should call with default options', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      renderHook(() => useGeolocation())

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })

    it('should call with custom options', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      renderHook(() => useGeolocation({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 1000,
      }))

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 1000,
        }
      )
    })
  })

  describe('geofence verification', () => {
    it('should verify user is within geofence', async () => {
      // User at Empire State Building
      const userLat = 40.748817
      const userLon = -73.985428

      // Site at Empire State Building (same location)
      const siteLat = 40.748817
      const siteLon = -73.985428

      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: userLat,
          longitude: userLon,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const { result } = renderHook(() => useGeolocation({
        siteCoordinates: { lat: siteLat, lon: siteLon },
        radiusMiles: 0.1,
      }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.verified).toBe(true)
      expect(result.current.latitude).toBe(userLat)
      expect(result.current.longitude).toBe(userLon)
    })

    it('should verify user is outside geofence', async () => {
      // User at Empire State Building, NYC
      const userLat = 40.748817
      const userLon = -73.985428

      // Site at Statue of Liberty, NYC (about 5 miles away)
      const siteLat = 40.689247
      const siteLon = -74.044502

      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: userLat,
          longitude: userLon,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const { result } = renderHook(() => useGeolocation({
        siteCoordinates: { lat: siteLat, lon: siteLon },
        radiusMiles: 0.1, // 0.1 miles radius
      }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.verified).toBe(false)
      expect(result.current.latitude).toBe(userLat)
      expect(result.current.longitude).toBe(userLon)
    })

    it('should not verify when no site coordinates provided', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const { result } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.verified).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle permission denied error', async () => {
      const mockError: GeolocationPositionError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError)
      })

      const { result } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Location permission denied')
      expect(result.current.latitude).toBeNull()
      expect(result.current.longitude).toBeNull()
      expect(result.current.verified).toBe(false)
    })

    it('should handle position unavailable error', async () => {
      const mockError: GeolocationPositionError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError)
      })

      const { result } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Location unavailable')
      expect(result.current.verified).toBe(false)
    })

    it('should handle timeout error', async () => {
      const mockError: GeolocationPositionError = {
        code: 3, // TIMEOUT
        message: 'Request timed out',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError)
      })

      const { result } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Location request timed out')
      expect(result.current.verified).toBe(false)
    })

    it('should handle browser not supporting geolocation', async () => {
      // Remove geolocation support
      Object.defineProperty(global.navigator, 'geolocation', {
        writable: true,
        value: undefined,
        configurable: true,
      })

      const { result } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Geolocation is not supported by your browser')
      expect(result.current.latitude).toBeNull()
      expect(result.current.longitude).toBeNull()
      expect(result.current.verified).toBe(false)
    })
  })
})

describe('calculateDistance', () => {
  it('should calculate distance between two nearby points', () => {
    // Empire State Building
    const lat1 = 40.748817
    const lon1 = -73.985428

    // Times Square (about 0.4 miles away)
    const lat2 = 40.758896
    const lon2 = -73.985130

    const distance = calculateDistance(lat1, lon1, lat2, lon2)

    // Distance should be approximately 0.7 miles
    expect(distance).toBeGreaterThan(0.6)
    expect(distance).toBeLessThan(0.8)
  })

  it('should calculate distance between same point as zero', () => {
    const lat = 40.7128
    const lon = -74.0060

    const distance = calculateDistance(lat, lon, lat, lon)

    expect(distance).toBe(0)
  })

  it('should calculate distance between distant points', () => {
    // New York
    const lat1 = 40.7128
    const lon1 = -74.0060

    // Los Angeles
    const lat2 = 34.0522
    const lon2 = -118.2437

    const distance = calculateDistance(lat1, lon1, lat2, lon2)

    // Distance should be approximately 2450 miles
    expect(distance).toBeGreaterThan(2400)
    expect(distance).toBeLessThan(2500)
  })

  it('should handle negative coordinates', () => {
    // Sydney, Australia
    const lat1 = -33.8688
    const lon1 = 151.2093

    // Melbourne, Australia
    const lat2 = -37.8136
    const lon2 = 144.9631

    const distance = calculateDistance(lat1, lon1, lat2, lon2)

    // Distance should be approximately 440 miles
    expect(distance).toBeGreaterThan(400)
    expect(distance).toBeLessThan(500)
  })

  it('should handle crossing the equator', () => {
    // North of equator
    const lat1 = 10.0
    const lon1 = 0.0

    // South of equator
    const lat2 = -10.0
    const lon2 = 0.0

    const distance = calculateDistance(lat1, lon1, lat2, lon2)

    // Distance should be approximately 1380 miles (20 degrees at equator)
    expect(distance).toBeGreaterThan(1350)
    expect(distance).toBeLessThan(1410)
  })
})

describe('isWithinGeofence', () => {
  it('should return true for points within geofence', () => {
    // Same location
    const userLat = 40.7128
    const userLon = -74.0060
    const siteLat = 40.7128
    const siteLon = -74.0060

    const result = isWithinGeofence(userLat, userLon, siteLat, siteLon, 0.1)

    expect(result).toBe(true)
  })

  it('should return false for points outside geofence', () => {
    // Empire State Building
    const userLat = 40.748817
    const userLon = -73.985428

    // Statue of Liberty (about 5 miles away)
    const siteLat = 40.689247
    const siteLon = -74.044502

    const result = isWithinGeofence(userLat, userLon, siteLat, siteLon, 0.1)

    expect(result).toBe(false)
  })

  it('should use default radius of 0.1 miles', () => {
    // Points about 0.05 miles apart (within default radius)
    const userLat = 40.7128
    const userLon = -74.0060
    const siteLat = 40.7135
    const siteLon = -74.0065

    const result = isWithinGeofence(userLat, userLon, siteLat, siteLon)

    expect(result).toBe(true)
  })

  it('should respect custom radius', () => {
    // Empire State Building
    const userLat = 40.748817
    const userLon = -73.985428

    // Times Square (about 0.7 miles away)
    const siteLat = 40.758896
    const siteLon = -73.985130

    // Should be outside 0.5 mile radius
    expect(isWithinGeofence(userLat, userLon, siteLat, siteLon, 0.5)).toBe(false)

    // Should be inside 1 mile radius
    expect(isWithinGeofence(userLat, userLon, siteLat, siteLon, 1.0)).toBe(true)
  })

  it('should handle points very close to the radius boundary', () => {
    const userLat = 40.7128
    const userLon = -74.0060

    // Calculate a point approximately 0.09 miles away (just inside radius)
    // Using approximation: 1 degree latitude ≈ 69 miles
    const radiusMiles = 0.1
    const latOffset = 0.09 / 69.0 // Slightly less than radius
    const siteLat = userLat + latOffset
    const siteLon = userLon

    const distance = calculateDistance(userLat, userLon, siteLat, siteLon)

    // Distance should be close to 0.09 miles
    expect(distance).toBeGreaterThan(0.08)
    expect(distance).toBeLessThan(0.10)

    // Should be within the geofence since distance < radius
    expect(isWithinGeofence(userLat, userLon, siteLat, siteLon, radiusMiles)).toBe(true)
  })
})
