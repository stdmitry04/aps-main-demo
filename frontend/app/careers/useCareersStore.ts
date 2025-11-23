import { create } from 'zustand';
import { PublicPosition } from '@/types';

interface CareersStore {
    // Data
    positions: PublicPosition[];

    // Filters
    searchTerm: string;
    departmentFilter: string;
    worksiteFilter: string;

    // Modal state
    selectedPosition: PublicPosition | null;
    showApplicationModal: boolean;
    showDetailsModal: boolean;
    showSuccessMessage: boolean;

    // Actions
    setPositions: (positions: PublicPosition[]) => void;
    setSearchTerm: (term: string) => void;
    setDepartmentFilter: (dept: string) => void;
    setWorksiteFilter: (site: string) => void;
    clearFilters: () => void;

    openDetailsModal: (position: PublicPosition) => void;
    closeDetailsModal: () => void;

    openApplicationModal: (position: PublicPosition) => void;
    closeApplicationModal: () => void;

    showSuccess: () => void;
    hideSuccess: () => void;

    // Computed
    hasActiveFilters: () => boolean;
}

export const useCareersStore = create<CareersStore>((set, get) => ({
    // Initial state
    positions: [],
    searchTerm: '',
    departmentFilter: 'all',
    worksiteFilter: 'all',
    selectedPosition: null,
    showApplicationModal: false,
    showDetailsModal: false,
    showSuccessMessage: false,

    // Actions
    setPositions: (positions) => set({ positions }),

    setSearchTerm: (searchTerm) => set({ searchTerm }),

    setDepartmentFilter: (departmentFilter) => set({ departmentFilter }),

    setWorksiteFilter: (worksiteFilter) => set({ worksiteFilter }),

    clearFilters: () => set({
        searchTerm: '',
        departmentFilter: 'all',
        worksiteFilter: 'all'
    }),

    openDetailsModal: (position) => set({
        selectedPosition: position,
        showDetailsModal: true,
        showApplicationModal: false
    }),

    closeDetailsModal: () => set({
        showDetailsModal: false
    }),

    openApplicationModal: (position) => set({
        selectedPosition: position,
        showApplicationModal: true,
        showDetailsModal: false
    }),

    closeApplicationModal: () => set({
        showApplicationModal: false
    }),

    showSuccess: () => {
        set({ showSuccessMessage: true });
        setTimeout(() => {
            set({ showSuccessMessage: false });
        }, 5000);
    },

    hideSuccess: () => set({ showSuccessMessage: false }),

    // Computed values
    hasActiveFilters: () => {
        const state = get();
        return state.searchTerm !== '' ||
            state.departmentFilter !== 'all' ||
            state.worksiteFilter !== 'all';
    },
}));