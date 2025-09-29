/**
 * @fileoverview This file contains components for displaying practical challenges,
 * including coding problems and machine coding rounds. It adapts its content for
 * both 'tech' and 'content' roles.
 * @author Mitesh
 */

import React, { useState, useEffect } from 'react';
import type { CodingChallenge, MachineCodingProblem, CodeSolution, MachineCodingSolution, RoleCategory } from '../types';
import CodeBlock from './CodeBlock';
import FormattedText from './FormattedText';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { generateMachineCodingSolution } from '../services/geminiService';
import RefreshButton from './RefreshButton';


type Language = keyof CodeSolution;

const languageNames: Record<Language, string> = {
    javascript: "JavaScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
};

/**
 * Renders a single coding or writing challenge.
 * For tech roles, it includes a language switcher to view solutions in different languages.
 * For content roles, it displays a single example response.
 * @param {object} props The component props.
 * @param {CodingChallenge} props.challenge The challenge data to display.
 * @param {RoleCategory} props.roleCategory The category of the role ('tech' or 'content').
 */
export const CodingChallengeItem: React.FC<{ challenge: CodingChallenge; roleCategory: RoleCategory; }> = ({ challenge, roleCategory }) => {
    // Determine which programming languages have available solutions.
    const availableLanguages = Object.keys(challenge.solutions).filter(lang => challenge.solutions[lang as Language] && challenge.solutions[lang as Language] !== 'N/A') as Language[];
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(availableLanguages[0] || 'javascript');

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80 p-4 sm:p-6">
            <h3 className="text-xl font-bold text-white mb-3">{challenge.title}</h3>
            <p className="text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed text-justify">{challenge.problem}</p>
            
            <div className="my-5 p-4 bg-slate-900/70 rounded-md ring-1 ring-slate-700">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">
                    {roleCategory === 'content' ? 'Guidelines' : 'Example'}
                </h4>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">{challenge.examples}</pre>
            </div>
            
            {/* Show language tabs only for tech roles */}
            {roleCategory === 'tech' && (
                <div className="mb-4">
                    <div className="p-1 bg-slate-700/50 rounded-lg flex gap-1 max-w-sm">
                        {availableLanguages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`flex-1 text-center px-3 py-1.5 text-sm font-medium transition-all rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selectedLanguage === lang ? 'bg-slate-900 shadow-sm text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}
                            >
                                {languageNames[lang]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Render the appropriate solution view based on role category */}
            {roleCategory === 'tech' ? (
                 challenge.solutions[selectedLanguage] && (
                    <CodeBlock 
                        code={challenge.solutions[selectedLanguage]!} 
                        language={selectedLanguage}
                    />
                )
            ) : (
                challenge.solutions.javascript && challenge.solutions.javascript !== 'N/A' && (
                    <div>
                        <h4 className="text-md font-semibold text-slate-300 mb-3">Example Response</h4>
                        <CodeBlock 
                            code={challenge.solutions.javascript} 
                            language="markdown"
                        />
                    </div>
                )
            )}
        </div>
    );
};

/**
 * Renders the machine coding round or practical content task.
 * The solution is fetched on-demand when the user clicks a button.
 * @param {object} props The component props.
 * @param {MachineCodingProblem} props.machineCoding The problem statement.
 */
export const MachineCodingRound: React.FC<{ machineCoding: MachineCodingProblem }> = ({ machineCoding }) => {
    const [solution, setSolution] = useState<MachineCodingSolution | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset the solution state if the problem changes.
    useEffect(() => {
        setSolution(null);
        setError(null);
        setIsFetching(false);
    }, [machineCoding]);

    const handleShowSolution = async () => {
        setIsFetching(true);
        setError(null);
        try {
            const result = await generateMachineCodingSolution(machineCoding.title, machineCoding.problem);
            setSolution(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Couldn't fetch the solution. The AI might be busy, please try again.");
            }
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80 p-4 sm:p-6">
            <h3 className="text-xl font-bold text-white mb-2">{machineCoding.title}</h3>
            <FormattedText text={machineCoding.problem} />
            
            {!solution && !isFetching && !error && (
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={handleShowSolution}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 shadow-md"
                    >
                        View Solution Guide
                    </button>
                </div>
            )}
            
            {isFetching && <LoadingSpinner />}
            {error && <div className="mt-4"><ErrorMessage message={error} /></div>}

            {solution && (
                <div className="mt-8 pt-6 border-t border-slate-700 space-y-4 fade-in">
                    <h3 className="text-lg font-semibold text-white">Solution Guide</h3>
                    <FormattedText text={solution.solutionGuide} />
                </div>
            )}
        </div>
    );
};

interface CodingChallengeDisplayProps {
  challenges: CodingChallenge[];
  machineCoding: MachineCodingProblem;
  roleCategory: RoleCategory;
  contentKey: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * The main component for the "Practical Challenges" tab.
 * It combines the `CodingChallengeItem` and `MachineCodingRound` components into a single view.
 * @param {CodingChallengeDisplayProps} props The component props.
 */
const CodingChallengeDisplay: React.FC<CodingChallengeDisplayProps> = ({ challenges, machineCoding, roleCategory, contentKey, onRefresh, isRefreshing }) => {
  return (
    // Using `key` prop here triggers the fade-in animation on content refresh.
    <div key={contentKey} className="w-full space-y-10 fade-in">
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {roleCategory === 'content' ? 'Writing Challenges' : 'Coding Challenges'}
                </h2>
                <RefreshButton onClick={onRefresh} isLoading={isRefreshing}>
                    Refresh Challenges
                </RefreshButton>
            </div>
            <div className="space-y-6">
                {challenges.map((c, index) => (
                    <CodingChallengeItem key={index} challenge={c} roleCategory={roleCategory} />
                ))}
            </div>
        </div>
         <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                {roleCategory === 'content' ? 'Practical Content Task' : 'Machine Coding Round'}
            </h2>
            <MachineCodingRound machineCoding={machineCoding} />
        </div>
    </div>
  );
};

export default CodingChallengeDisplay;
