/**
 * @fileoverview The main view for the "Home" tab.
 * It serves as the landing page for the application, featuring the primary `JobInputForm`
 * and a welcome message to guide the user.
 * @author Mitesh
 */

import React from 'react';
import JobInputForm from './JobInputForm';
import Footer from './Footer';
import ErrorMessage from './ErrorMessage';

// Props are passed down from the main App component to manage the form's state.
interface HomeProps {
  jobRole: string;
  setJobRole: (role: string) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  resume: string;
  setResume: (resume: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** A static component to display a welcome message and brief instructions. */
const WelcomeMessage: React.FC = () => (
    <div className="text-center p-8 bg-slate-800/30 rounded-lg ring-1 ring-slate-700/80 flex flex-col items-center gap-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-700/50 text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
            </svg>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to CodePulse!</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Your personal interview coach is ready. Enter a job role to generate a full prep kit. For best results, add the job description and your resume.</p>
        </div>
    </div>
);

/**
 * Renders the Home page layout, which includes the sticky input form at the top,
 * a main content area for the welcome message, and the footer.
 * @param {HomeProps} props The component props.
 */
const Home: React.FC<HomeProps> = (props) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <JobInputForm {...props} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center gap-8">
            {props.error && <ErrorMessage message={props.error} onRetry={props.onRetry} />}
            <WelcomeMessage />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
