/**
 * @fileoverview The main input form for the application.
 * It allows users to enter a job role, and optionally a job description and resume,
 * to generate a personalized interview prep kit.
 * @author Mitesh
 */

import React, { useState } from 'react';

interface JobInputFormProps {
  jobRole: string;
  setJobRole: (role: string) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  resume: string;
  setResume: (resume: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

// --- Icons ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
);
const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);
// --- End Icons ---


/**
 * Renders the primary input form for generating interview preparation materials.
 * It's a sticky form at the top of the Home page.
 * @param {JobInputFormProps} props The component's props for state management and event handling.
 */
const JobInputForm: React.FC<JobInputFormProps> = ({ jobRole, setJobRole, jobDescription, setJobDescription, resume, setResume, onSubmit, isLoading }) => {
  // State to control the visibility of optional JD and resume text areas.
  const [showOptional, setShowOptional] = useState(false);

  return (
    <div className="bg-slate-950/70 backdrop-blur-lg border-b border-slate-700/50 p-4">
        <form onSubmit={onSubmit} className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full">
                <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="Enter Job Role (e.g., Content Writer, Software Engineer @ Google)"
                    className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg py-4 px-5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                    disabled={isLoading}
                />
            </div>
             <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700/50 px-5 py-4 rounded-lg transition"
                title={showOptional ? "Hide optional details" : "Add Job Description and Resume for better results"}
            >
                {showOptional ? (
                    <>
                        <MinusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Hide Details</span>
                    </>
                ) : (
                    <>
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Details</span>
                    </>
                )}
            </button>
            <button
                type="submit"
                disabled={isLoading || !jobRole.trim()}
                className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-3 font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg shadow-blue-600/20 text-base"
            >
                 <SparkleIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Generating...' : 'Generate Prep Kit'}
            </button>
        </form>
        {/* The optional fields are revealed with a fade-in animation. */}
        {showOptional && (
            <div className="max-w-7xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 fade-in bg-slate-900 p-4 rounded-lg border border-slate-800">
                <div className="relative">
                    <label htmlFor="job-description" className="absolute -top-2 left-3 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-400">Job Description (Optional)</label>
                    <textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                        rows={6}
                        className="w-full bg-slate-900/70 border border-slate-700 text-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={isLoading}
                    />
                </div>
                 <div className="relative">
                    <label htmlFor="resume" className="absolute -top-2 left-3 inline-block bg-slate-900 px-1 text-xs font-medium text-slate-400">Your Resume (Optional)</label>
                    <textarea
                        id="resume"
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        placeholder="Paste your resume contents here..."
                        rows={6}
                        className="w-full bg-slate-900/70 border border-slate-700 text-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={isLoading}
                    />
                </div>
            </div>
        )}
    </div>
  );
};

export default JobInputForm;
