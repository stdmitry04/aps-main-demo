import { useState, useCallback, useEffect } from 'react';
import { JobTemplate } from '@/types/hiring';
import { api } from '@/lib/api';

interface UseJobTemplatesReturn {
  templates: JobTemplate[];
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchTemplateById: (id: string) => Promise<JobTemplate>;
  createTemplate: (data: JobTemplate) => Promise<JobTemplate>;
  updateTemplate: (id: string, data: Partial<JobTemplate>) => Promise<JobTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateByJobTitle: (jobTitle: string) => JobTemplate | undefined;
  getTemplatesByEmployeeCategory: (category: string) => JobTemplate[];
  searchTemplates: (searchTerm: string) => JobTemplate[];
}

export function useJobTemplates(): UseJobTemplatesReturn {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useJobTemplates] Fetching templates...');
      const response = await api.get('/hiring/templates/');
      // Handle both paginated and non-paginated responses
      const data = response.data;
      console.log('[useJobTemplates] Received response:', response);
      console.log('[useJobTemplates] Templates data:', data);
      console.log('[useJobTemplates] Is array?', Array.isArray(data));

      // Extract templates from paginated response or use array directly
      const templates = data.results || (Array.isArray(data) ? data : []);
      console.log('[useJobTemplates] Extracted templates:', templates);
      console.log('[useJobTemplates] Templates count:', templates.length);
      setTemplates(templates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      console.error('[useJobTemplates] Error fetching templates:', err);
      // On error, ensure we still have an array
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const fetchTemplateById = useCallback(
    async (id: string): Promise<JobTemplate> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/hiring/templates/${id}/`);
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
    async (data: JobTemplate): Promise<JobTemplate> => {
      try {
        setLoading(true);
        setError(null);
        console.log('[useJobTemplates] Creating template with data:', data);
        const response = await api.post('/hiring/templates/', data);
        const newTemplate = response.data;
        console.log('[useJobTemplates] Template created successfully:', newTemplate);
        setTemplates(prev => {
          const updated = [...prev, newTemplate];
          console.log('[useJobTemplates] Updated templates list:', updated);
          console.log('[useJobTemplates] New templates count:', updated.length);
          return updated;
        });
        return newTemplate;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
        setError(errorMessage);
        console.error('[useJobTemplates] Error creating template:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTemplate = useCallback(
    async (id: string, data: Partial<JobTemplate>): Promise<JobTemplate> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.patch(`/hiring/templates/${id}/`, data);
        const updatedTemplate = response.data;
        setTemplates(prev =>
          prev.map(template => (template.id === id ? updatedTemplate : template))
        );
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
        await api.delete(`/hiring/templates/${id}/`);
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

  const getTemplateByJobTitle = useCallback(
    (jobTitle: string): JobTemplate | undefined => {
      return templates.find(t => t.primaryJobTitle === jobTitle);
    },
    [templates]
  );

  const getTemplatesByEmployeeCategory = useCallback(
    (category: string): JobTemplate[] => {
      return templates.filter(t => t.employeeCategory === category);
    },
    [templates]
  );

  const searchTemplates = useCallback(
    (searchTerm: string): JobTemplate[] => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return templates.filter(
        t =>
          t.templateName.toLowerCase().includes(lowerSearchTerm) ||
          t.primaryJobTitle.toLowerCase().includes(lowerSearchTerm) ||
          t.department.toLowerCase().includes(lowerSearchTerm)
      );
    },
    [templates]
  );

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateByJobTitle,
    getTemplatesByEmployeeCategory,
    searchTemplates
  };
}
