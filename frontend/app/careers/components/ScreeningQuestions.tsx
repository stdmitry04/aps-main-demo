import React from 'react';
import { ScreeningQuestion } from '@/types';

interface ScreeningQuestionsProps {
  questions: ScreeningQuestion[];
  answers: Record<string, string>;
  onChange: (questionId: string, answer: string) => void;
  errors: Record<string, string>;
}

export function ScreeningQuestions({ 
  questions, 
  answers, 
  onChange, 
  errors 
}: ScreeningQuestionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Screening Questions
        </h3>
        <p className="text-sm text-gray-600">
          Please answer the following questions to help us understand your qualifications.
        </p>
      </div>

      <div className="space-y-5">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 rounded-lg p-4">
            <label className="block mb-3">
              <div className="flex items-start gap-2 mb-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {question.question}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
              </div>

              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => onChange(question.id, e.target.value)}
                rows={4}
                placeholder="Type your answer here..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm ${
                  errors[question.id] 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
              />

              {errors[question.id] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[question.id]}
                </p>
              )}
            </label>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {question.required ? 'Required' : 'Optional'} • Category: {question.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips for great answers:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Be specific and provide concrete examples</li>
              <li>Keep responses concise but informative</li>
              <li>Proofread your answers before submitting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
