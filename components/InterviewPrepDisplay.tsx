/**
 * @fileoverview This component is responsible for displaying the Question & Answer section
 * of the generated interview prep kit. It separates general/HR questions from technical questions
 * into two distinct columns for clarity.
 * @author Mitesh
 */

import React from 'react';
import type { InterviewQuestion } from '../types';
import QuestionAnswer from './QuestionAnswer';
import RefreshButton from './RefreshButton';

interface InterviewPrepDisplayProps {
  /** An array of general/HR interview questions. */
  generalQuestions: InterviewQuestion[];
  /** An array of technical or role-specific interview questions. */
  technicalQuestions: InterviewQuestion[];
  /** A key used to force re-render the component with a fade-in animation when content updates. */
  contentKey: number;
  /** The job role for which the questions were generated. */
  jobRole: string;
  /** Callback function to refresh the questions. */
  onRefresh: () => void;
  /** Boolean indicating if the refresh operation is in progress. */
  isRefreshing: boolean;
}

/**
 * Renders the Q&A view with general and technical questions in a two-column layout.
 * @param {InterviewPrepDisplayProps} props The component's props.
 */
const InterviewPrepDisplay: React.FC<InterviewPrepDisplayProps> = ({ generalQuestions, technicalQuestions, contentKey, jobRole, onRefresh, isRefreshing }) => {
    const hasQuestions = generalQuestions.length > 0 || technicalQuestions.length > 0;

    // Don't render anything if there's no data.
    if (!hasQuestions) {
        return null;
    }

    return (
        // Using `key` prop here triggers the fade-in animation on content refresh.
        <div key={contentKey} className="w-full space-y-8 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Q&amp;A for <span className="text-blue-400">{jobRole}</span></h1>
                <RefreshButton onClick={onRefresh} isLoading={isRefreshing}>
                    Refresh Questions
                </RefreshButton>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Questions Column */}
                <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
                    <h2 className="text-xl font-bold text-white p-5 border-b border-slate-700">General HR Questions</h2>
                    <div className="p-3 space-y-2">
                        {generalQuestions.map((q, index) => (
                            <QuestionAnswer key={`gen-${index}`} question={q.question} answer={q.answer} />
                        ))}
                    </div>
                </div>
                {/* Technical Questions Column */}
                <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
                    <h2 className="text-xl font-bold text-white p-5 border-b border-slate-700">Technical Questions</h2>
                    <div className="p-3 space-y-2">
                        {technicalQuestions.map((q, index) => (
                            <QuestionAnswer key={`tech-${index}`} question={q.question} answer={q.answer} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewPrepDisplay;
