import { useState, useCallback, useEffect } from 'react';
import { locationApi, WorkLocation } from '../../timeandattendance/hooks/locations';

interface UseWorkLocationsReturn {
  locations: WorkLocation[];
  activeLocations: WorkLocation[];
  loading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  getLocationNames: () => string[];
  getActiveLocationNames: () => string[];
  getLocationById: (id: number) => WorkLocation | undefined;
  getLocationByName: (name: string) => WorkLocation | undefined;
}

export function useWorkLocations(): UseWorkLocationsReturn {
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await locationApi.getLocations();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work locations';
      setError(errorMessage);
      console.error('Error fetching work locations:', err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const activeLocations = locations.filter(loc => loc.active);

  const getLocationNames = useCallback((): string[] => {
    return locations.map(loc => loc.name);
  }, [locations]);

  const getActiveLocationNames = useCallback((): string[] => {
    return activeLocations.map(loc => loc.name);
  }, [activeLocations]);

  const getLocationById = useCallback(
    (id: number): WorkLocation | undefined => {
      return locations.find(loc => loc.id === id);
    },
    [locations]
  );

  const getLocationByName = useCallback(
    (name: string): WorkLocation | undefined => {
      return locations.find(loc => loc.name.toLowerCase() === name.toLowerCase());
    },
    [locations]
  );

  return {
    locations,
    activeLocations,
    loading,
    error,
    fetchLocations,
    getLocationNames,
    getActiveLocationNames,
    getLocationById,
    getLocationByName
  };
}