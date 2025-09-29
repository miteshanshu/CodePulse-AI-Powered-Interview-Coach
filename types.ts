/**
 * @fileoverview This file contains all the core TypeScript type definitions used throughout the CodePulse application.
 * It defines the data structures for interview questions, coding challenges, company insights, and more,
 * ensuring type safety and clear data contracts between components and services.
 * @author Mitesh
 */


/** Defines the category of a job role, used to tailor content appropriately. */
export type RoleCategory = 'tech' | 'content';

/** Defines the difficulty levels for randomized practice sets. */
export type DifficultyLevel = 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior';

/** Represents a single interview question and its model answer. */
export interface InterviewQuestion {
  question: string;
  answer: string;
}

/** A collection of general and technical interview questions. */
export interface InterviewQuestions {
    generalQuestions: InterviewQuestion[];
    technicalQuestions: InterviewQuestion[];
}

/** Represents a single system design question and a detailed model answer. */
export interface SystemDesignQuestion {
    question: string;
    answer: string;
}

/** Contains code solutions for a challenge in various programming languages. */
export interface CodeSolution {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
}

/** Represents a complete coding challenge, including the problem statement, examples, and solutions. */
export interface CodingChallenge {
    title: string;
    problem: string;
    examples: string;
    solutions: CodeSolution;
}

/** Represents a machine coding round problem statement. */
export interface MachineCodingProblem {
    title: string;
    problem: string;
}

/** Represents the solution guide for a machine coding problem. */
export interface MachineCodingSolution {
    solutionGuide: string;
}

/** Represents a complete, randomized practice set generated for a specific role and difficulty. */
export interface RandomizedPrepSet {
    roleCategory: RoleCategory;
    generalQuestions: InterviewQuestion[];
    technicalQuestions: InterviewQuestion[];
    systemDesignQuestions: SystemDesignQuestion[];
    codingChallenges: CodingChallenge[];
    machineCoding: MachineCodingProblem;
}

/** Represents the full, personalized interview preparation kit generated for a user. */
export interface FullInterviewPrep {
    roleCategory: RoleCategory;
    generalQuestions: InterviewQuestion[];
    technicalQuestions: InterviewQuestion[];
    codingChallenges: CodingChallenge[];
    machineCoding: MachineCodingProblem;
}

/** Represents a single web source used for grounding company insights. */
export interface GroundingSource {
  uri: string;
  title: string;
}

/** Contains the AI-generated content and grounding sources for company research. */
export interface CompanyInsights {
  content: string;
  sources: GroundingSource[];
}

/** Represents a single message in a chat-based feature like Mock Interview or Doubt Buster. */
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    onRetry?: () => void;
}

/** Represents the complete analysis of a resume against a job description. */
export interface ResumeAnalysis {
  matchScore: number;
  atsFriendliness: string;
  resumeSummary: string;
  overallFeedback: string;
  strengths: string;
  improvementSuggestions: string;
  jdKeywords: string[];
  missingKeywords: string[];
}
