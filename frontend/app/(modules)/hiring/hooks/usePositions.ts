import { useState, useCallback, useEffect } from 'react';
import { Position, PositionFormData, InterviewStage } from '@/types/hiring';
import { api } from '@/lib/api';

interface UsePositionsReturn {
  positions: Position[];
  loading: boolean;
  error: string | null;
  createPosition: (data: PositionFormData) => Promise<Position>;
  updatePosition: (id: string, data: Partial<PositionFormData>) => Promise<Position>;
  deletePosition: (id: string) => Promise<void>;
  fetchPositions: () => Promise<void>;
  fetchPositionById: (id: string) => Promise<any>;
}

export function usePositions(): UsePositionsReturn {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/hiring/positions/');

      // api.ts interceptor automatically transforms snake_case to camelCase
      const positionsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setPositions(positionsData);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch positions';
      setError(errorMessage);
      console.error('Error fetching positions:', err);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const createPosition = useCallback(
    async (data: PositionFormData): Promise<Position> => {
      try {
        setLoading(true);
        setError(null);

        // api.ts interceptor automatically transforms camelCase to snake_case
        const response = await api.post('/hiring/positions/', data);
        const newPosition = response.data;

        setPositions(prev => [newPosition, ...prev]);
        await fetchPositions();

        return newPosition;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Failed to create position';
        setError(errorMessage);
        console.error('Error creating position:', err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchPositions]
  );

  const updatePosition = useCallback(
    async (id: string, data: Partial<PositionFormData>): Promise<Position> => {
      try {
        setLoading(true);
        setError(null);

        // api.ts interceptor automatically transforms camelCase to snake_case
        const response = await api.patch(`/hiring/positions/${id}/`, data);
        const updatedPosition = response.data;

        setPositions(prev => prev.map(pos => (pos.id === id ? updatedPosition : pos)));
        return updatedPosition;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Failed to update position';
        setError(errorMessage);
        console.error('Error updating position:', err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deletePosition = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/hiring/positions/${id}/`);
      setPositions(prev => prev.filter(pos => pos.id !== id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to delete position';
      setError(errorMessage);
      console.error('Error deleting position:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPositionById = useCallback(
    async (id: string): Promise<any> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/hiring/positions/${id}/`);
        return response.data;
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch position';
        setError(errorMessage);
        console.error('Error fetching position:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    positions,
    loading,
    error,
    createPosition,
    updatePosition,
    deletePosition,
    fetchPositions,
    fetchPositionById,
  };
}