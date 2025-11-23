import { ScreeningQuestion, PublicPosition } from '@/types';

export const screeningQuestionsPool: ScreeningQuestion[] = [
  {
    id: 'cert-1',
    question: 'Do you currently hold a valid teaching certification in the state of Illinois?',
    category: 'certification',
    required: true
  },
  {
    id: 'cert-2',
    question: 'What type of teaching certification do you hold? (e.g., Type 03, Type 09, LBS1, etc.)',
    category: 'certification',
    required: true
  },
  {
    id: 'exp-1',
    question: 'How many years of teaching experience do you have in your subject area?',
    category: 'experience',
    required: true
  },
  {
    id: 'exp-2',
    question: 'Describe your experience working with diverse student populations.',
    category: 'experience',
    required: true
  },
  {
    id: 'exp-3',
    question: 'Have you previously worked in a K-12 educational setting?',
    category: 'experience',
    required: true
  },
  {
    id: 'skill-1',
    question: 'What learning management systems (LMS) are you proficient in? (e.g., Canvas, Schoology, Google Classroom)',
    category: 'skills',
    required: false
  },
  {
    id: 'skill-2',
    question: 'Describe your approach to classroom management and student engagement.',
    category: 'skills',
    required: true
  },
  {
    id: 'skill-3',
    question: 'What strategies do you use to differentiate instruction for students with varying abilities?',
    category: 'skills',
    required: true
  },
  {
    id: 'avail-1',
    question: 'Are you available to work full-time (1.0 FTE)?',
    category: 'availability',
    required: true
  },
  {
    id: 'avail-2',
    question: 'Are you willing to participate in after-school activities, professional development, or extracurricular programs?',
    category: 'availability',
    required: false
  },
  {
    id: 'gen-1',
    question: 'Why are you interested in joining School District 308?',
    category: 'general',
    required: true
  },
  {
    id: 'gen-2',
    question: 'What do you believe are the most important qualities of an effective educator?',
    category: 'general',
    required: true
  },
  {
    id: 'gen-3',
    question: 'How do you stay current with educational best practices and pedagogical approaches?',
    category: 'general',
    required: false
  },
  {
    id: 'sped-1',
    question: 'Do you have experience developing and implementing Individualized Education Programs (IEPs)?',
    category: 'skills',
    required: false
  },
  {
    id: 'sped-2',
    question: 'What is your experience working with students with special needs?',
    category: 'experience',
    required: false
  }
];

