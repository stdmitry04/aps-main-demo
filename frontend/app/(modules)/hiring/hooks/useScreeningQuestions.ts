import { useState, useCallback, useEffect } from 'react';
import { ScreeningQuestion } from '@/types';
import { api } from '@/lib/api';

interface UseScreeningQuestionsReturn {
  questions: ScreeningQuestion[];
  loading: boolean;
  error: string | null;
  createQuestion: (data: Partial<ScreeningQuestion>) => Promise<ScreeningQuestion>;
  updateQuestion: (id: string, data: Partial<ScreeningQuestion>) => Promise<ScreeningQuestion>;
  deleteQuestion: (id: string) => Promise<void>;
  fetchQuestions: (category?: string) => Promise<void>;
  searchQuestions: (searchTerm: string, category?: string) => ScreeningQuestion[];
  getQuestionsByCategory: (category: string) => ScreeningQuestion[];
  getCategories: () => string[];
}

export function useScreeningQuestions(): UseScreeningQuestionsReturn {
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useScreeningQuestions] Fetching questions with category:', category);
      const params = category ? { category } : {};
      const response = await api.get('/hiring/screening-questions/', { params });
      console.log('[useScreeningQuestions] API response:', response);
      // Handle both paginated and non-paginated responses
      const data = response.data;
      const questions = data.results || (Array.isArray(data) ? data : []);
      console.log('[useScreeningQuestions] Data received:', data);
      console.log('[useScreeningQuestions] Extracted questions:', questions);
      console.log('[useScreeningQuestions] Number of questions:', questions.length);
      if (questions.length > 0) {
        console.log('[useScreeningQuestions] Sample question:', questions[0]);
      }
      setQuestions(questions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
      setError(errorMessage);
      console.error('[useScreeningQuestions] Error fetching questions:', err);
      // On error, ensure we still have an array
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const createQuestion = useCallback(
    async (data: Partial<ScreeningQuestion>): Promise<ScreeningQuestion> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/hiring/screening-questions/', data);
        const newQuestion = response.data;
        setQuestions(prev => [...prev, newQuestion]);
        return newQuestion;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create question';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateQuestion = useCallback(
    async (id: string, data: Partial<ScreeningQuestion>): Promise<ScreeningQuestion> => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.patch(`/hiring/screening-questions/${id}/`, data);
        const updatedQuestion = response.data;
        setQuestions(prev =>
          prev.map(q => (q.id === id ? updatedQuestion : q))
        );
        return updatedQuestion;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update question';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/hiring/screening-questions/${id}/`);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchQuestions = useCallback(
    (searchTerm: string, category?: string): ScreeningQuestion[] => {
      return questions.filter(q => {
        const matchesSearch = q.question
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory = !category || q.category === category;
        return matchesSearch && matchesCategory;
      });
    },
    [questions]
  );

  const getQuestionsByCategory = useCallback(
    (category: string): ScreeningQuestion[] => {
      return questions.filter(q => q.category === category);
    },
    [questions]
  );

  const getCategories = useCallback((): string[] => {
    const categories = new Set(questions.map(q => q.category));
    return Array.from(categories).sort();
  }, [questions]);

  return {
    questions,
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    fetchQuestions,
    searchQuestions,
    getQuestionsByCategory,
    getCategories
  };
}
