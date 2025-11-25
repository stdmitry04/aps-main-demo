import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export interface OfferTemplate {
  id: string;
  name: string;
  templateText: string;
  description?: string;
  isActive: boolean;
  extractedFields: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferTemplateData {
  name: string;
  templateText: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateOfferTemplateData {
  name?: string;
  templateText?: string;
  description?: string;
  isActive?: boolean;
}

export interface PreviewTemplateData {
  data: Record<string, string>;
}

export interface PreviewTemplateResponse {
  filledText: string;
  extractedFields: string[];
}

interface UseOfferTemplatesReturn {
  templates: OfferTemplate[];
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchTemplateById: (id: string) => Promise<OfferTemplate>;
  createTemplate: (data: CreateOfferTemplateData) => Promise<OfferTemplate>;
  updateTemplate: (id: string, data: UpdateOfferTemplateData) => Promise<OfferTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  previewTemplate: (id: string, data: Record<string, string>) => Promise<PreviewTemplateResponse>;
  extractFields: (templateText: string) => string[];
  filterByActive: () => OfferTemplate[];
}

export function useOfferTemplates(): UseOfferTemplatesReturn {
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/hiring/offer-templates/');
      // Handle paginated response from Django REST Framework
      const data = response.data.results ? response.data.results : response.data;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const fetchTemplateById = useCallback(
    async (id: string): Promise<OfferTemplate> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/hiring/offer-templates/${id}/`);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch template';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createTemplate = useCallback(
    async (data: CreateOfferTemplateData): Promise<OfferTemplate> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/hiring/offer-templates/', data);
        const newTemplate = response.data;
        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTemplate = useCallback(
    async (id: string, data: UpdateOfferTemplateData): Promise<OfferTemplate> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.patch(`/hiring/offer-templates/${id}/`, data);
        const updatedTemplate = response.data;
        setTemplates(prev => prev.map(template => (template.id === id ? updatedTemplate : template)));
        return updatedTemplate;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await api.delete(`/hiring/offer-templates/${id}/`);
        setTemplates(prev => prev.filter(template => template.id !== id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const previewTemplate = useCallback(
    async (id: string, data: Record<string, string>): Promise<PreviewTemplateResponse> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post(`/hiring/offer-templates/${id}/preview/`, { data });
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to preview template';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const extractFields = useCallback((templateText: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const fields = new Set<string>();
    let match;
    while ((match = regex.exec(templateText)) !== null) {
      fields.add(match[1]);
    }
    return Array.from(fields);
  }, []);

  const filterByActive = useCallback((): OfferTemplate[] => {
    return templates.filter(template => template.isActive);
  }, [templates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    previewTemplate,
    extractFields,
    filterByActive
  };
}
