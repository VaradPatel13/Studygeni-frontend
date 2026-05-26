import { Document as MongooseDocument, Types } from 'mongoose';

export interface IUser extends MongooseDocument {
  username: string;
  email: string;
  password?: string;
  profileImage?: string;
  mobileNumber: string;
  subscriptionPlan?: 'free' | 'starter' | 'professional' | 'enterprise';
  matchPassword: (candidatePassword: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument extends MongooseDocument {
  userId: Types.ObjectId | string;
  title: string;
  filename: string;
  filepath: string;
  filesize: number;
  fileType: string;
  extractedText: string;
  chunks: Array<{
    content: string;
    pageNumber: number;
    chunkIndex: number;
  }>;
  uploadDate: Date;
  lastAccessed: Date;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlashcard extends MongooseDocument {
  userId: Types.ObjectId | string;
  documentId: Types.ObjectId | string;
  cards: Array<{
    _id?: any;
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    lastReviewed: Date;
    reviewCount: number;
    isStarred: boolean;
  }>;
}

export interface IQuiz extends MongooseDocument {
  userId: Types.ObjectId | string;
  documentId: Types.ObjectId | string;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  userAnswers: Array<{
    questionIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
    answeredAt: Date;
  }>;
  score: number;
  totalQuestions: number;
  completedAt: Date | null;
}
