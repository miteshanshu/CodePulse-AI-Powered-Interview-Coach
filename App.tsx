/**
 * @fileoverview This is the root component of the CodePulse application.
 * It manages the main application state, including user inputs, generated prep data,
 * loading/error states, and the currently active tab. It orchestrates the entire user experience.
 * @author Mitesh
 */

import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import PageLayout from './components/PageLayout';
import InterviewPrepDisplay from './components/InterviewPrepDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Sidebar from './components/Tabs';
import CodingChallengeDisplay from './components/CodingChallengeDisplay';
import CompanyInsightsView from './components/CompanyInsightsView';
import MockInterview from './components/MockInterview';
import DreamCompanyView from './components/RandomizeChallengesView';
import ResumeAnalyzerView from './components/ResumeAnalyzerView';
import DoubtBuster from './components/DoubtBuster';
import UserManual from './components/UserManual';
import { generateFullInterviewPrep } from './services/geminiService';
import type { FullInterviewPrep } from './types';
import { useAppContext } from './contexts/AppContext';

/** Defines the possible tabs the user can navigate to. */
export type Tab = "Home" | "Q&A" | "Practical Challenges" | "Company Insights" | "Mock Interview" | "Dream Company" | "Resume Analyzer" | "Doubt Buster" | "User Manual";

const App: React.FC = () => {
  // --- State Management ---
  // User inputs for generating the prep kit
  const [jobRole, setJobRole] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resume, setResume] = useState<string>('');

  // Data, loading, and error states for the main generation flow
  const [prepData, setPrepData] = useState<FullInterviewPrep | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  
  // Keys to force re-render of child components with animations on data refresh
  const [qaKey, setQaKey] = useState(0);
  const [codingKey, setCodingKey] = useState(0);

  // Global context for the "Explain This" feature
  const { textToExplain } = useAppContext();

  /**
   * Effect to automatically switch to the "Doubt Buster" tab
   * when the user clicks an "Explain this" button anywhere in the app.
   */
  useEffect(() => {
    if (textToExplain) {
      setActiveTab('Doubt Buster');
    }
  }, [textToExplain]);

  /**
   * Handles the primary action of generating a full interview prep kit.
   */
  const handleGenerate = async () => {
    if (!jobRole.trim()) {
      setError("Please enter a job role.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPrepData(null);

    try {
      const data = await generateFullInterviewPrep(jobRole, jobDescription, resume);
      setPrepData(data);
      // Increment keys to trigger fade-in animations
      setQaKey(k => k + 1);
      setCodingKey(k => k + 1);
      // Navigate to the Q&A tab after successful generation
      setActiveTab("Q&A");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Form submission handler. Prevents default form behavior and calls the generation function.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  /**
   * Handles refreshing the content of the Q&A and Practical Challenges tabs
   * with a new set of data for the same job role.
   */
  const handleRefresh = async () => {
    if (!jobRole.trim()) return;

    setIsRefreshing(true);
    setError(null);
    
    try {
      const data = await generateFullInterviewPrep(jobRole, jobDescription, resume);
      setPrepData(data);
      setQaKey(k => k + 1);
      setCodingKey(k => k + 1);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while refreshing.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Main conditional rendering logic for the application.
   * It determines which view to display based on the `activeTab` state.
   */
  const renderContent = () => {
    // The Home tab has a unique layout and manages its own loading/error states.
    if (activeTab === "Home") {
      return (
        <Home
          jobRole={jobRole}
          setJobRole={setJobRole}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          resume={resume}
          setResume={setResume}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          onRetry={handleGenerate}
        />
      );
    }

    // All other tabs use a consistent page layout.
    return (
      <PageLayout>
        {(() => {
          // These tabs are self-contained and manage their own internal states.
          if (activeTab === "Doubt Buster") return <DoubtBuster />;
          if (activeTab === "Resume Analyzer") return <ResumeAnalyzerView />;
          if (activeTab === "Dream Company") return <DreamCompanyView />;
          if (activeTab === "Company Insights") return <CompanyInsightsView jobRole={jobRole} />;
          if (activeTab === "Mock Interview") return <MockInterview />;
          if (activeTab === "User Manual") return <UserManual />;

          // The following tabs depend on the global loading/error state from the main generation flow.
          if (isLoading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
          if (error && !prepData) return <ErrorMessage message={error} onRetry={handleGenerate} />;

          if (!prepData) {
            // Fallback for when data isn't ready but a data-dependent tab is selected.
            return null; 
          }

          // Render the content for data-dependent tabs.
          switch (activeTab) {
            case "Q&A":
              return <InterviewPrepDisplay generalQuestions={prepData.generalQuestions} technicalQuestions={prepData.technicalQuestions} contentKey={qaKey} jobRole={jobRole} onRefresh={handleRefresh} isRefreshing={isRefreshing} />;
            case "Practical Challenges":
              return <CodingChallengeDisplay challenges={prepData.codingChallenges} machineCoding={prepData.machineCoding} roleCategory={prepData.roleCategory} contentKey={codingKey} onRefresh={handleRefresh} isRefreshing={isRefreshing} />;
            default:
              return null;
          }
        })()}
      </PageLayout>
    );
  };


  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        // Disable data-dependent tabs if no data has been generated yet.
        disabled={!prepData && !isLoading}
      />
      {renderContent()}
    </div>
  );
};

export default App;
