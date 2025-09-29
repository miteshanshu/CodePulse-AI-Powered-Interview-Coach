/**
 * @fileoverview A view for the "Dream Company Prep" feature.
 * This allows users to generate a randomized set of interview questions and challenges
 * for any job role and a specified difficulty level, simulating prep for top-tier companies.
 * @author Mitesh
 */

import React, { useState } from 'react';
import { generateRandomizedPrepSet } from '../services/geminiService';
import type { RandomizedPrepSet, DifficultyLevel } from '../types';
import { CodingChallengeItem, MachineCodingRound } from './CodingChallengeDisplay';
import QuestionAnswer from './QuestionAnswer';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import RefreshButton from './RefreshButton';

const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992m0 0-3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183" />
    </svg>
);

const difficultyLevels: DifficultyLevel[] = ['Fresher', 'Junior', 'Mid-Level', 'Senior'];

const DreamCompanyView: React.FC = () => {
    // --- State Management ---
    const [data, setData] = useState<RandomizedPrepSet | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contentKey, setContentKey] = useState(0); // For re-render animations

    // Input state for the form
    const [jobRoleInput, setJobRoleInput] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('Fresher');
    
    // State to display what the current set was generated for
    const [generatedFor, setGeneratedFor] = useState<string | null>(null);
    // State to remember the last generation parameters for the refresh button
    const [lastGeneratedParams, setLastGeneratedParams] = useState<{ role: string, difficulty: DifficultyLevel } | null>(null);

    /**
     * Fetches a new randomized prep set from the API.
     * @param {string} role The job role for the prep set.
     * @param {DifficultyLevel} diff The difficulty level.
     */
    const generateSet = async (role: string, diff: DifficultyLevel) => {
        if (!role.trim()) {
            setError("Please enter a job role to generate a practice set.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const result = await generateRandomizedPrepSet(role, diff);
            setData(result);
            setGeneratedFor(`${role} (${diff})`);
            setLastGeneratedParams({ role, difficulty: diff });
            setContentKey(k => k + 1); // Trigger animation
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while generating challenges.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generateSet(jobRoleInput, difficulty);
    };

    const handleRetry = () => {
        generateSet(jobRoleInput, difficulty);
    };

    const handleRefresh = () => {
        if (lastGeneratedParams) {
            generateSet(lastGeneratedParams.role, lastGeneratedParams.difficulty);
        }
    };

    return (
        <div className="w-full space-y-8">
            {/* Input Form Section */}
            <div className="p-6 bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Dream Company Prep</h2>
                            <p className="text-slate-400 mt-1">Generate a practice set tailored to the difficulty level of top companies.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !jobRoleInput.trim()}
                            className="flex w-full sm:w-auto items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2.5 px-5 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg shadow-blue-600/20"
                        >
                            <GenerateIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Generating...' : 'Generate Prep'}
                        </button>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-4">
                        <div>
                            <label htmlFor="job-role-random" className="block text-sm font-medium text-slate-300 mb-2">Job Role</label>
                             <input
                                id="job-role-random"
                                type="text"
                                value={jobRoleInput}
                                onChange={(e) => setJobRoleInput(e.target.value)}
                                placeholder="e.g., Senior Python Developer"
                                className="w-full sm:max-w-xs bg-slate-900/70 border border-slate-700 text-slate-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty Level</label>
                            <div className="flex flex-wrap gap-2">
                                {difficultyLevels.map(level => (
                                    <button
                                        type="button"
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        disabled={isLoading}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed ${
                                            difficulty === level
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            {/* Display Area for Loading, Errors, and Content */}
            {error && <ErrorMessage message={error} onRetry={handleRetry} />}

            {!data && !isLoading && !error && (
                 <div className="text-center p-8 bg-slate-800/30 rounded-lg ring-1 ring-slate-700/80">
                    <p className="text-slate-400">Enter a job role, select a difficulty, and click the button above to generate a new practice set.</p>
                </div>
            )}
            
            {isLoading && <LoadingSpinner />}
            
            {data && (
                <div className="space-y-10">
                    {generatedFor && (
                         <div className="mb-8 flex flex-col sm:flex-row justify-center items-center text-center gap-4">
                            <h2 className="text-xl font-semibold text-white">Practice Set for: <span className="text-blue-400">{generatedFor}</span></h2>
                            <RefreshButton onClick={handleRefresh} isLoading={isLoading}>
                                Refresh Set
                            </RefreshButton>
                        </div>
                    )}
                    <div key={contentKey} className="w-full space-y-10 fade-in">
                        {/* Q&A Section */}
                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
                                <h2 className="text-xl font-bold text-white p-5 border-b border-slate-700">General HR Questions</h2>
                                <div className="p-3 space-y-2">
                                    {data.generalQuestions.map((q, index) => (
                                        <QuestionAnswer key={`gen-rand-${index}`} question={q.question} answer={q.answer} />
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
                                <h2 className="text-xl font-bold text-white p-5 border-b border-slate-700">
                                {data.roleCategory === 'content' ? 'Role-Specific Questions' : 'Technical Questions'}
                                </h2>
                                <div className="p-3 space-y-2">
                                    {data.technicalQuestions.map((q, index) => (
                                        <QuestionAnswer key={`tech-rand-${index}`} question={q.question} answer={q.answer} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* System Design */}
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                                {data.roleCategory === 'content' ? 'Strategic Questions' : 'System Design Questions'}
                            </h2>
                            <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
                                <div className="p-3 space-y-2">
                                    {data.systemDesignQuestions.map((q, index) => (
                                        <QuestionAnswer key={`design-rand-${index}`} question={q.question} answer={q.answer} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Coding Challenges */}
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                                {data.roleCategory === 'content' ? 'Writing Challenges' : 'Coding Challenges'}
                            </h2>
                            <div className="space-y-6">
                                {data.codingChallenges.map((c, index) => (
                                    <CodingChallengeItem key={`code-rand-${index}`} challenge={c} roleCategory={data.roleCategory} />
                                ))}
                            </div>
                        </div>

                        {/* Machine Coding Round */}
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                                {data.roleCategory === 'content' ? 'Practical Content Task' : 'Machine Coding Round'}
                            </h2>
                            <MachineCodingRound machineCoding={data.machineCoding} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DreamCompanyView;
