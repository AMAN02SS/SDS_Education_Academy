import React from 'react';
import { motion } from 'motion/react';
import { Play, BookOpen, Star, ChevronRight } from 'lucide-react';

export const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

export const MOCK_SUBJECTS = [
  {
    id: '1',
    title: 'Mathematics: Algebra & Geometry',
    description: 'Comprehensive video lessons covering linear equations, triangles, and trigonometry for Class 10.',
    thumbnail: 'https://picsum.photos/seed/math/800/450',
    grade: 'Class 10',
    subject: 'Mathematics',
    lessons: 24,
    rating: 4.9,
    chapters: [
      { id: 'c1', title: 'Real Numbers', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'c2', title: 'Polynomials', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'c3', title: 'Pair of Linear Equations', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    id: '2',
    title: 'Physics: Laws of Motion',
    description: 'Understand the fundamental principles of physics with interactive experiments and visual explanations.',
    thumbnail: 'https://picsum.photos/seed/physics/800/450',
    grade: 'Class 11',
    subject: 'Physics',
    lessons: 18,
    rating: 4.8,
    chapters: [
      { id: 'p1', title: 'Units and Measurements', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'p2', title: 'Motion in a Straight Line', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    id: '3',
    title: 'Biology: The Living World',
    description: 'Explore the diversity of life and biological processes through detailed video lectures.',
    thumbnail: 'https://picsum.photos/seed/biology/800/450',
    grade: 'Class 12',
    subject: 'Biology',
    lessons: 20,
    rating: 4.7,
    chapters: [
      { id: 'b1', title: 'Reproduction in Organisms', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'b2', title: 'Sexual Reproduction in Flowering Plants', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  }
];

export const MOCK_NOTES = [
  {
    id: '1',
    title: 'Trigonometry Formulas & Concepts',
    subject: 'Mathematics',
    grade: 'Class 10',
    author: 'Admin',
    date: 'Oct 12, 2025',
    downloads: '1.2k',
    content: 'Detailed trigonometry notes content...',
    pdfUrl: 'https://cdn.pixabay.com/pdf/2023/04/27/12-05-34-456_640.pdf' // Stable placeholder PDF
  },
  {
    id: '2',
    title: 'Periodic Table Trends',
    subject: 'Chemistry',
    grade: 'Class 11',
    author: 'Admin',
    date: 'Nov 05, 2025',
    downloads: '850',
    content: 'Chemistry periodic table notes content...',
    pdfUrl: 'https://cdn.pixabay.com/pdf/2023/04/27/12-05-34-456_640.pdf'
  },
  {
    id: '3',
    title: 'English Grammar: Tenses & Voice',
    subject: 'English',
    grade: 'Class 8',
    author: 'Admin',
    date: 'Dec 20, 2025',
    downloads: '2.4k',
    content: 'English grammar notes content...',
    pdfUrl: 'https://cdn.pixabay.com/pdf/2023/04/27/12-05-34-456_640.pdf'
  },
  {
    id: '4',
    title: 'Algebraic Identities',
    subject: 'Mathematics',
    grade: 'Class 10',
    author: 'Admin',
    date: 'Jan 10, 2026',
    downloads: '1.5k',
    content: 'Algebraic identities notes...',
    pdfUrl: 'https://cdn.pixabay.com/pdf/2023/04/27/12-05-34-456_640.pdf'
  },
  {
    id: '5',
    title: 'Cell Structure and Function',
    subject: 'Biology',
    grade: 'Class 9',
    author: 'Admin',
    date: 'Feb 15, 2026',
    downloads: '900',
    content: 'Cell biology notes...',
    pdfUrl: 'https://cdn.pixabay.com/pdf/2023/04/27/12-05-34-456_640.pdf'
  }
];

export const MOCK_BLOGS = [
  {
    id: '1',
    title: 'How to Prepare for Board Exams in 3 Months',
    excerpt: 'Effective study strategies and time management tips to ace your upcoming board examinations.',
    content: `
      # How to Prepare for Board Exams in 3 Months
      
      Board exams can be stressful, but with a solid 3-month plan, you can achieve excellence.
      
      ## 1. Create a Schedule
      Divide your time between subjects based on difficulty.
      
      ## 2. Focus on NCERT
      For CBSE students, NCERT is the bible. Ensure every concept is clear.
      
      ## 3. Practice Sample Papers
      Solving previous year papers helps in understanding the exam pattern.
    `,
    thumbnail: 'https://picsum.photos/seed/study/600/400',
    author: 'Dr. Sharma',
    date: 'Jan 15, 2026',
    category: 'Exam Tips'
  },
  {
    id: '2',
    title: 'The Importance of Mental Health for Students',
    excerpt: 'Why taking breaks and managing stress is crucial for long-term academic success.',
    content: `
      # The Importance of Mental Health for Students
      
      Academic success is not just about grades; it's about overall well-being.
      
      ## Why it matters
      Stress can lead to burnout and decreased productivity.
      
      ## Tips for Students
      - Take regular breaks.
      - Sleep at least 7-8 hours.
      - Talk to someone if you feel overwhelmed.
    `,
    thumbnail: 'https://picsum.photos/seed/health/600/400',
    author: 'Priya Verma',
    date: 'Feb 02, 2026',
    category: 'Wellness'
  }
];

export const MOCK_QUIZZES = [
  {
    id: 'q1',
    grade: 'Class 10',
    subject: 'Mathematics',
    title: 'Real Numbers Basics',
    questions: [
      { question: 'What is a rational number?', options: ['A number that can be expressed as p/q', 'A number with no end', 'A square root of 2', 'None'], answer: 0 },
      { question: 'Is 0 a rational number?', options: ['Yes', 'No'], answer: 0 }
    ]
  }
];

export const MOCK_NCERT = [
  {
    id: 'n1',
    grade: 'Class 10',
    subject: 'Mathematics',
    title: 'Chapter 1: Real Numbers (Exercise 1.1)',
    pdfUrl: 'https://cdn.pixabay.com/pdf/2023/04/27/12-05-34-456_640.pdf',
    author: 'Admin',
    date: 'Feb 15, 2026',
    solutions: [
      { question: 'Use Euclid\'s division algorithm to find the HCF of 135 and 225.', answer: 'Since 225 > 135, we apply the division lemma to 225 and 135 to obtain 225 = 135 × 1 + 90...' }
    ]
  }
];
