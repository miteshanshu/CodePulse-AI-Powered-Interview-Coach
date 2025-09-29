/**
 * @fileoverview This component provides a view for fetching and displaying company insights.
 * It uses the Gemini API with Google Search grounding to get up-to-date information.
 * It can automatically extract a company name from the main job role input or be used with a manual search.
 * @author Mitesh
 */

import React, { useState, useEffect, useCallback } from 'react';
import { generateCompanyInsights } from '../services/geminiService';
import type { CompanyInsights } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import FormattedText from './FormattedText';

interface CompanyInsightsViewProps {
  /** The job role string from the main input, used to auto-populate the search. */
  jobRole: string;
}

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

/**
 * A helper function to extract a company name from a job role string.
 * It assumes the company name follows an '@' symbol.
 * @param {string} role The job role string (e.g., "Software Engineer @ Google").
 * @returns {string} The extracted company name or an empty string.
 */
const extractCompanyName = (role: string): string => {
  if (!role) return '';
  const parts = role.split('@');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  return '';
};

const CompanyInsightsView: React.FC<CompanyInsightsViewProps> = ({ jobRole }) => {
  const [insights, setInsights] = useState<CompanyInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedCompany, setSearchedCompany] = useState('');

  /**
   * Fetches insights for a given company name.
   * Wrapped in useCallback to prevent re-creation on every render.
   */
  const fetchInsights = useCallback(async (name: string) => {
    if (!name) return;
    setIsLoading(true);
    setError(null);
    setInsights(null);
    setSearchedCompany(name);
    try {
      const result = await generateCompanyInsights(name);
      setInsights(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching company insights.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * An effect that runs when the global `jobRole` prop changes.
   * It attempts to extract a company name and automatically fetches insights.
   */
  useEffect(() => {
    const name = extractCompanyName(jobRole);
    setSearchTerm(name);
    if (name) {
      fetchInsights(name);
    } else {
      // If no company name can be extracted, clear the view.
      setInsights(null);
      setError(null);
      setIsLoading(false);
      setSearchedCompany('');
    }
  }, [jobRole, fetchInsights]);

  /** Handles manual search submission. */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInsights(searchTerm);
  };

  /** Handles retrying a failed search. */
  const handleRetry = () => {
    if (searchedCompany) {
        fetchInsights(searchedCompany);
    }
  };
  
  /** Conditionally renders the main content area based on the current state. */
  const renderContent = () => {
    if (isLoading) {
      return <div className="mt-8"><LoadingSpinner /></div>;
    }
    if (error) {
      return <div className="mt-8"><ErrorMessage message={error} onRetry={handleRetry} /></div>;
    }
    if (!insights && !isLoading && !error) {
      return (
        <div className="text-center p-8 mt-8 bg-slate-800/30 rounded-lg ring-1 ring-slate-700/80">
          <h2 className="text-xl font-bold text-white mb-2">Get Company Insights</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Use the search bar above to get the latest insights on any company.</p>
        </div>
      );
    }
    if (insights) {
      return (
        <div className="mt-8 bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80 p-5 sm:p-7 fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Briefing on {searchedCompany}</h2>
          <FormattedText text={insights.content} />
          {/* Display the grounding sources (URLs) from the search. */}
          {insights.sources && insights.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">Sources</h3>
              <ul className="space-y-3">
                {insights.sources.map((source, index) => (
                  <li key={index} className="text-sm flex items-start gap-3">
                    <span className="text-slate-500 mt-1">&rarr;</span>
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors decoration-blue-400/50 underline-offset-2 break-all"
                    >
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Search input bar */}
      <div className="p-6 bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
        <h2 className="text-2xl font-bold text-white">Company Insights Search</h2>
        <p className="text-slate-400 mt-1">Enter a company name to get the latest research briefing.</p>
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., Google, Microsoft, Netflix..."
                className="w-full bg-slate-900/70 border border-slate-700 text-slate-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className="flex-shrink-0 flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-all"
                title="Search for company insights"
            >
                <SearchIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
            </button>
        </form>
      </div>
      {/* Main content display area */}
      {renderContent()}
    </div>
  );
};

export default CompanyInsightsView;
