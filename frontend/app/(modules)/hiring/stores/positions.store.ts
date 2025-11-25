import { create } from 'zustand';
import { api } from '@/lib/api';
import { Position, PositionFormData } from '@/types/hiring';

interface PositionsState {
  positions: Position[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Actions
  fetchPositions: () => Promise<void>;
  fetchPositionById: (id: string) => Promise<any>;
  createPosition: (data: PositionFormData) => Promise<Position>;
  updatePosition: (id: string, data: Partial<PositionFormData>) => Promise<Position>;
  deletePosition: (id: string) => Promise<void>;
  setPositions: (positions: Position[]) => void;
}

export const usePositionsStore = create<PositionsState>((set, get) => ({
  positions: [],
  loading: false,
  error: null,
  lastFetchTime: null,

  setPositions: (positions) => set({ positions }),

  fetchPositions: async () => {
    // Don't re-fetch if we recently fetched (within 5 seconds)
    const { lastFetchTime } = get();
    const now = Date.now();
    if (lastFetchTime && (now - lastFetchTime) < 5000) {
      console.log('⚡ Using cached positions (fetched recently)');
      return;
    }

    try {
      set({ loading: true, error: null });
      const response = await api.get('/hiring/positions/');

      const positionsData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      set({
        positions: positionsData,
        lastFetchTime: Date.now()
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch positions';
      set({ error: errorMessage, positions: [] });
      console.error('Error fetching positions:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchPositionById: async (id: string): Promise<any> => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/hiring/positions/${id}/`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch position';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  createPosition: async (data: PositionFormData): Promise<Position> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/hiring/positions/', data);
      const newPosition = response.data;

      // Add to list and refresh
      set((state) => ({
        positions: [newPosition, ...state.positions]
      }));

      // Refresh to get latest data
      await get().fetchPositions();

      return newPosition;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create position';
      set({ error: errorMessage });
      console.error('Error creating position:', err);
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  updatePosition: async (id: string, data: Partial<PositionFormData>): Promise<Position> => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch(`/hiring/positions/${id}/`, data);
      const updatedPosition = response.data;

      set((state) => ({
        positions: state.positions.map(pos => (pos.id === id ? updatedPosition : pos))
      }));

      return updatedPosition;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to update position';
      set({ error: errorMessage });
      console.error('Error updating position:', err);
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  deletePosition: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/hiring/positions/${id}/`);

      set((state) => ({
        positions: state.positions.filter(pos => pos.id !== id)
      }));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to delete position';
      set({ error: errorMessage });
      console.error('Error deleting position:', err);
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));
