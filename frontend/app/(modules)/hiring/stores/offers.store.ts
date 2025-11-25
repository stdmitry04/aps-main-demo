import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Offer {
  id: string;
  applicationId: string;
  salary: number;
  fte: number;
  startDate: string;
  benefits: string[];
  offerDate: string;
  expirationDate: string;
  template?: string;
  templateText?: string;
  templateData?: Record<string, string>;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'Withdrawn';
  acceptedDate?: string;
  declinedReason?: string;
  // Read-only fields from serializer (already transformed to camelCase by API interceptor)
  candidateName: string;
  candidateEmail: string;
  positionTitle: string;
  positionReqId: string;
  department: string;
  worksite: string;
  employeeCategory: string;
}

interface CreateOfferData {
  application: string;
  salary: number;
  fte: number;
  start_date: string;
  benefits?: string[];
  offer_date: string;
  expiration_date: string;
  template?: string;
  template_text?: string;
  template_data?: Record<string, string>;
}

interface OffersFilters {
  searchTerm: string;
  statusFilter: string;
  districtFilter: string;
  positionFilter: string;
  dateFilter: string;
}

interface OffersState {
  // Data State
  offers: Offer[];
  loading: boolean;
  error: string | null;

  // Filters
  filters: OffersFilters;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setDistrictFilter: (district: string) => void;
  setPositionFilter: (position: string) => void;
  setDateFilter: (date: string) => void;
  clearFilters: () => void;

  // Computed/Derived State
  filteredOffers: Offer[];

  // Modal State
  selectedOffer: Offer | null;
  showDetailsModal: boolean;
  showNewOfferModal: boolean;
  setSelectedOffer: (offer: Offer | null) => void;
  setShowDetailsModal: (show: boolean) => void;
  setShowNewOfferModal: (show: boolean) => void;

  // Actions
  viewOfferDetails: (offer: Offer) => void;
  closeDetailsModal: () => void;
  openNewOfferModal: () => void;
  closeNewOfferModal: () => void;

  // API Actions
  fetchOffers: () => Promise<void>;
  fetchOfferById: (id: string) => Promise<Offer>;
  createOffer: (data: CreateOfferData) => Promise<Offer>;
  updateOffer: (id: string, data: Partial<Offer>) => Promise<Offer>;
  deleteOffer: (id: string) => Promise<void>;
  acceptOffer: (offerId: string) => Promise<Offer>;
  declineOffer: (offerId: string, reason?: string) => Promise<Offer>;
  getExpiringOffers: (days?: number) => Promise<Offer[]>;
  getOfferStats: () => Promise<any>;
  filterByStatus: (status: Offer['status']) => Offer[];
  filterByApplicationId: (applicationId: string) => Offer | undefined;
}

const initialFilters: OffersFilters = {
  searchTerm: '',
  statusFilter: 'All',
  districtFilter: 'All',
  positionFilter: 'All',
  dateFilter: 'All',
};

export const useOffersStore = create<OffersState>((set, get) => ({
  // Initial state
  offers: [],
  loading: false,
  error: null,
  filters: initialFilters,
  selectedOffer: null,
  showDetailsModal: false,
  showNewOfferModal: false,

  // Filter actions
  setSearchTerm: (term) => set((state) => ({
    filters: { ...state.filters, searchTerm: term }
  })),

  setStatusFilter: (status) => set((state) => ({
    filters: { ...state.filters, statusFilter: status }
  })),

  setDistrictFilter: (district) => set((state) => ({
    filters: { ...state.filters, districtFilter: district }
  })),

  setPositionFilter: (position) => set((state) => ({
    filters: { ...state.filters, positionFilter: position }
  })),

  setDateFilter: (date) => set((state) => ({
    filters: { ...state.filters, dateFilter: date }
  })),

  clearFilters: () => set({ filters: initialFilters }),

  // Computed/Derived State
  get filteredOffers(): Offer[] {
    const { offers, filters } = get();
    return offers.filter(offer => {
      const matchesSearch =
        offer.candidateName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        offer.positionTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        offer.candidateEmail.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        offer.worksite.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus = filters.statusFilter === 'All' || offer.status === filters.statusFilter;
      const matchesDistrict = filters.districtFilter === 'All' || offer.worksite === filters.districtFilter;
      const matchesPosition = filters.positionFilter === 'All' || offer.positionTitle === filters.positionFilter;

      // Date filtering based on offer date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const offerDate = new Date(offer.offerDate);
      offerDate.setHours(0, 0, 0, 0);

      let matchesDate = true;
      if (filters.dateFilter === 'This Week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = offerDate >= weekAgo;
      } else if (filters.dateFilter === 'This Month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = offerDate >= startOfMonth;
      } else if (filters.dateFilter === 'Last 30 Days') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDate = offerDate >= thirtyDaysAgo;
      } else if (filters.dateFilter === 'Expiring Soon') {
        const expirationDate = new Date(offer.expirationDate);
        expirationDate.setHours(0, 0, 0, 0);
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        matchesDate = offer.status === 'Pending' && expirationDate >= today && expirationDate <= threeDaysFromNow;
      }

      return matchesSearch && matchesStatus && matchesDate && matchesDistrict && matchesPosition;
    });
  },

  // Modal state actions
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  setShowDetailsModal: (show) => set({ showDetailsModal: show }),
  setShowNewOfferModal: (show) => set({ showNewOfferModal: show }),

  // Combined actions
  viewOfferDetails: (offer) => set({
    selectedOffer: offer,
    showDetailsModal: true
  }),

  closeDetailsModal: () => set({
    selectedOffer: null,
    showDetailsModal: false
  }),

  openNewOfferModal: () => set({ showNewOfferModal: true }),

  closeNewOfferModal: () => set({ showNewOfferModal: false }),

  // API Actions
  fetchOffers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/hiring/offers/');
      const data = response.data.results ? response.data.results : response.data;
      set({ offers: Array.isArray(data) ? data : [] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offers';
      set({ error: errorMessage });
      console.error('Error fetching offers:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchOfferById: async (id: string): Promise<Offer> => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/hiring/offers/${id}/`);
      const data = Array.isArray(response.data.results) ? response.data.results : response.data;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offer';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  createOffer: async (data: CreateOfferData): Promise<Offer> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/hiring/offers/', data);
      const newOffer = response.data;
      set((state) => ({ offers: [...state.offers, newOffer] }));
      return newOffer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create offer';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateOffer: async (id: string, data: Partial<Offer>): Promise<Offer> => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch(`/hiring/offers/${id}/`, data);
      const updatedOffer = response.data;
      set((state) => ({
        offers: state.offers.map(offer => (offer.id === id ? updatedOffer : offer))
      }));
      return updatedOffer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update offer';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteOffer: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/hiring/offers/${id}/`);
      set((state) => ({
        offers: state.offers.filter(offer => offer.id !== id)
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete offer';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  acceptOffer: async (offerId: string): Promise<Offer> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post(`/hiring/offers/${offerId}/accept/`);
      const acceptedOffer = response.data;
      set((state) => ({
        offers: state.offers.map(offer => (offer.id === offerId ? acceptedOffer : offer))
      }));
      return acceptedOffer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept offer';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  declineOffer: async (offerId: string, reason?: string): Promise<Offer> => {
    try {
      set({ loading: true, error: null });
      const data = reason ? { reason } : {};
      const response = await api.post(`/hiring/offers/${offerId}/decline/`, data);
      const declinedOffer = response.data;
      set((state) => ({
        offers: state.offers.map(offer => (offer.id === offerId ? declinedOffer : offer))
      }));
      return declinedOffer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decline offer';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  getExpiringOffers: async (days: number = 7): Promise<Offer[]> => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/hiring/offers/expiring_soon/', {
        params: { days }
      });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expiring offers';
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  getOfferStats: async () => {
    try {
      const response = await api.get('/hiring/offers/stats/');
      return response.data;
    } catch (err) {
      console.error('Error fetching offer stats:', err);
      throw err;
    }
  },

  filterByStatus: (status: Offer['status']): Offer[] => {
    return get().offers.filter(offer => offer.status === status);
  },

  filterByApplicationId: (applicationId: string): Offer | undefined => {
    return get().offers.find(offer => offer.applicationId === applicationId);
  },
}));
