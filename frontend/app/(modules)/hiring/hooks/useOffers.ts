import { useState, useCallback, useEffect } from 'react';
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
    startDate: string;
    benefits?: string[];
    offer_date: string;
    expiration_date: string;
    template_text?: string;
    template_data?: Record<string, string>;
}

interface UseOffersReturn {
    offers: Offer[];
    loading: boolean;
    error: string | null;
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

export function useOffers(): UseOffersReturn {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/hiring/offers/');
            // Handle paginated response from Django REST Framework
            const data = response.data.results ? response.data.results : response.data;
            setOffers(Array.isArray(data) ? data : []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offers';
            setError(errorMessage);
            console.error('Error fetching offers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const fetchOfferById = useCallback(
        async (id: string): Promise<Offer> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/hiring/offers/${id}/`);
                const data = Array.isArray(response.data.results) ? response.data.results : []
                return data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offer';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const createOffer = useCallback(
        async (data: CreateOfferData): Promise<Offer> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.post('/hiring/offers/', data);
                const newOffer = response.data;
                setOffers(prev => [...prev, newOffer]);
                return newOffer;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to create offer';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const updateOffer = useCallback(
        async (id: string, data: Partial<Offer>): Promise<Offer> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.patch(`/hiring/offers/${id}/`, data);
                const updatedOffer = response.data;
                setOffers(prev => prev.map(offer => (offer.id === id ? updatedOffer : offer)));
                return updatedOffer;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to update offer';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deleteOffer = useCallback(
        async (id: string) => {
            try {
                setLoading(true);
                setError(null);
                await api.delete(`/hiring/offers/${id}/`);
                setOffers(prev => prev.filter(offer => offer.id !== id));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to delete offer';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const acceptOffer = useCallback(
        async (offerId: string): Promise<Offer> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.post(`/hiring/offers/${offerId}/accept/`);
                const acceptedOffer = response.data;
                setOffers(prev => prev.map(offer => (offer.id === offerId ? acceptedOffer : offer)));
                return acceptedOffer;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to accept offer';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const declineOffer = useCallback(
        async (offerId: string, reason?: string): Promise<Offer> => {
            try {
                setLoading(true);
                setError(null);
                const data = reason ? { reason } : {};
                const response = await api.post(`/hiring/offers/${offerId}/decline/`, data);
                const declinedOffer = response.data;
                setOffers(prev => prev.map(offer => (offer.id === offerId ? declinedOffer : offer)));
                return declinedOffer;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to decline offer';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getExpiringOffers = useCallback(
        async (days: number = 7): Promise<Offer[]> => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/hiring/offers/expiring_soon/', {
                    params: { days }
                });
                return response.data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expiring offers';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getOfferStats = useCallback(async () => {
        try {
            const response = await api.get('/hiring/offers/stats/');
            return response.data;
        } catch (err) {
            console.error('Error fetching offer stats:', err);
            throw err;
        }
    }, []);

    const filterByStatus = useCallback(
        (status: Offer['status']): Offer[] => {
            return offers.filter(offer => offer.status === status);
        },
        [offers]
    );

    const filterByApplicationId = useCallback(
        (applicationId: string): Offer | undefined => {
            return offers.find(offer => offer.applicationId === applicationId);
        },
        [offers]
    );

    return {
        offers,
        loading,
        error,
        fetchOffers,
        fetchOfferById,
        createOffer,
        updateOffer,
        deleteOffer,
        acceptOffer,
        declineOffer,
        getExpiringOffers,
        getOfferStats,
        filterByStatus,
        filterByApplicationId
    };
}
