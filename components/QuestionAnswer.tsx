/**
 * @fileoverview A reusable accordion-style component to display a question and its collapsible answer.
 * It includes a button to send the question to the "Doubt Buster" feature for a more detailed explanation.
 * @author Mitesh
 */

import React, { useState } from 'react';
import type { InterviewQuestion } from '../types';
import FormattedText from './FormattedText';
import ExplainButton from './ExplainButton';

/** A simple chevron icon used to indicate the accordion's open/closed state. */
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

/**
 * Renders a single interview question. The answer is hidden by default and can be revealed by clicking.
 * @param {InterviewQuestion} props The question and answer to display.
 */
const QuestionAnswer: React.FC<InterviewQuestion> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-800/50 rounded-lg transition-colors duration-200 hover:bg-slate-700/40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg group"
        aria-expanded={isOpen}
      >
        <div className="flex-grow flex items-start gap-2 pr-4">
            <h3 className="text-md font-medium text-slate-200">{question}</h3>
            {/* The 'ExplainButton' appears on hover, allowing users to get more details on the question. */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
                <ExplainButton text={question} />
            </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {/* The answer container uses a grid-rows transition for a smooth expand/collapse animation. */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
             <div className="text-slate-300 px-4 pt-0 pb-4 text-sm">
                <div className="border-t border-slate-700 pt-4">
                  <FormattedText text={answer} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionAnswer;
