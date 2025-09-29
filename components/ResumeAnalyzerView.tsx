/**
 * @fileoverview A feature-rich view for analyzing a resume against a job description.
 * It provides a comprehensive dashboard with a match score, ATS feedback, keyword analysis,
 * and AI-generated suggestions. The entire dashboard can be exported as a PDF.
 * @author Mitesh
 */


import React, { useState, useRef } from 'react';
import { analyzeResume } from '../services/geminiService';
import type { ResumeAnalysis } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import FormattedText from './FormattedText';

// Make PDF generation libraries (loaded in index.html) available on the window object.
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

// --- Icons ---
const AnalyzeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const StarIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.134-.662 1.456 0l1.861 3.832 4.232.616c.734.107 1.028.998.494 1.512l-3.06 2.983.722 4.215c.125.73-.641 1.286-1.28.944L10 15.349l-3.774 1.985c-.64.342-1.405-.213-1.28-.944l.722-4.215-3.06-2.983c-.534-.514-.24-.1405.494-1.512l4.232-.616 1.861-3.832z" clipRule="evenodd" /></svg>);
const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clipRule="evenodd" /></svg>);
const ArrowCircleRightIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z" clipRule="evenodd" /></svg>);
const CircleStackIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10 2a.75.75 0 01.75.75v.518a9 9 0 014.821 1.623.75.75 0 01-.84 1.228 7.501 7.501 0 00-7.962 0 .75.75 0 01-.84-1.228A9 9 0 019.25 3.268V2.75A.75.75 0 0110 2zM10 6a.75.75 0 01.75.75v.518a9 9 0 014.821 1.623.75.75 0 01-.84 1.228 7.501 7.501 0 00-7.962 0 .75.75 0 01-.84-1.228A9 9 0 019.25 7.268V6.75A.75.75 0 0110 6zM10 10a.75.75 0 01.75.75v.518a9 9 0 014.821 1.623.75.75 0 01-.84 1.228 7.501 7.501 0 00-7.962 0 .75.75 0 01-.84-1.228A9 9 0 019.25 11.268v-.518A.75.75 0 0110 10z" /></svg>);
const ChatBubbleIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm5.28-2.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>);
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);
// --- End Icons ---


/**
 * A circular progress bar component to visualize the resume match score.
 * The color of the circle changes based on the score value.
 * @param {{ score: number }} props The component props.
 */
const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = () => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const colorClass = getScoreColor();
    const circumference = 2 * Math.PI * 45; // Radius is 45
    // Calculate the stroke offset to represent the score percentage.
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle className="text-slate-700/50" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
                {/* Foreground progress circle */}
                <circle
                    className={colorClass}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.25, 1, 0.5, 1)' }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${colorClass}`}>
                <span className="text-3xl sm:text-4xl font-bold font-sans">{score}<span className="text-xl sm:text-2xl opacity-80">%</span></span>
            </div>
        </div>
    );
};

/**
 * A reusable card component for displaying information sections in the dashboard.
 * @param {object} props The component props.
 */
const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; variant?: 'light' | 'dark' }> = ({ title, icon, children, variant = 'dark' }) => {
    const bgColor = variant === 'light' ? 'bg-slate-800' : 'bg-slate-800/50';
    return (
        <div className={`${bgColor} p-5 rounded-xl shadow-lg ring-1 ring-slate-700/50 h-full`}>
            <h3 className="flex items-center gap-3 text-base font-semibold text-slate-200 mb-4" title={title}>
                {icon}
                {title}
            </h3>
            <div className="text-sm text-slate-300">{children}</div>
        </div>
    );
};


const ResumeAnalyzerView: React.FC = () => {
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const dashboardRef = useRef<HTMLDivElement>(null);

    /**
     * Handles the analysis request to the backend service.
     */
    const handleAnalyze = async () => {
        if (!resume.trim() || !jobDescription.trim()) {
            setError("Please paste both your resume and the job description.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeResume(resume, jobDescription);
            setAnalysis(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while analyzing.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles exporting the analysis dashboard to a PDF file.
     */
    const handleExportPdf = async () => {
        if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
            console.error("PDF generation libraries are not loaded.");
            return;
        }

        const dashboardContent = dashboardRef.current;
        if (!dashboardContent) return;

        setIsExporting(true);

        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(dashboardContent, {
                scale: 2,
                backgroundColor: '#0f172a', // slate-900
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / pdfWidth;
            const scaledHeight = imgHeight / ratio;

            let heightLeft = scaledHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - scaledHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('resume-analysis-dashboard.pdf');
        } catch (error) {
            console.error("Failed to export PDF:", String(error));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="w-full space-y-8">
            {/* Input Section */}
            <div className="p-6 bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80">
                <h2 className="text-2xl font-bold text-white">AI-Powered Resume Analyzer</h2>
                <p className="text-slate-400 mt-1">Get instant feedback on how well your resume matches a job description.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="resume-input" className="block text-sm font-medium text-slate-300 mb-2">Your Resume</label>
                        <textarea
                            id="resume-input"
                            value={resume}
                            onChange={(e) => setResume(e.target.value)}
                            placeholder="Paste your full resume here..."
                            rows={12}
                            className="w-full bg-slate-900/70 border border-slate-700 text-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            disabled={isLoading}
                            aria-label="Resume Input"
                        />
                    </div>
                    <div>
                        <label htmlFor="jd-input" className="block text-sm font-medium text-slate-300 mb-2">Job Description</label>
                        <textarea
                            id="jd-input"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here..."
                            rows={12}
                            className="w-full bg-slate-900/70 border border-slate-700 text-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            disabled={isLoading}
                            aria-label="Job Description Input"
                        />
                    </div>
                </div>
                 <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !resume.trim() || !jobDescription.trim()}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2.5 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg shadow-blue-600/20"
                    >
                        <AnalyzeIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                    </button>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}
            {isLoading && <LoadingSpinner />}

            {/* Analysis Dashboard */}
            {analysis && (
                <div className="fade-in space-y-8">
                     <div className="flex justify-center items-center gap-4 relative">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center tracking-tight">Analysis Dashboard</h1>
                        <button
                            onClick={handleExportPdf}
                            disabled={isExporting}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600/50 disabled:cursor-not-allowed text-slate-300 px-3 py-1.5 rounded-md text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-sans"
                            aria-label="Export dashboard to PDF"
                            title="Export dashboard to PDF"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            {isExporting ? 'Exporting...' : 'Export PDF'}
                        </button>
                    </div>
                    
                    <div ref={dashboardRef} className="space-y-8">
                        {/* Top Row: Score and Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg ring-1 ring-slate-700/50 flex flex-col items-center justify-center text-center">
                                <h3 className="text-sm sm:text-base font-semibold text-slate-200 mb-3">Resume Match Score</h3>
                                <ScoreCircle score={analysis.matchScore} />
                                <p className="text-xs sm:text-sm text-slate-400 mt-3">How well you match the job description</p>
                            </div>
                            <div className="lg:col-span-2">
                                <InfoCard variant="dark" title="AI-Generated Professional Summary" icon={<StarIcon className="w-5 h-5 text-yellow-400" />}>
                                    <FormattedText text={analysis.resumeSummary} />
                                </InfoCard>
                            </div>
                        </div>

                        {/* Second Row: Strengths and Improvements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard variant="light" title="Strengths" icon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}>
                                <FormattedText text={analysis.strengths} listStyle="check" />
                            </InfoCard>
                            <InfoCard variant="dark" title="Improvement Suggestions" icon={<ArrowCircleRightIcon className="w-5 h-5 text-orange-400" />}>
                                <FormattedText text={analysis.improvementSuggestions} listStyle="arrow" />
                            </InfoCard>
                        </div>

                        {/* Third Row: ATS and Feedback */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard variant="light" title="ATS Friendliness Check" icon={<CircleStackIcon className="w-5 h-5 text-blue-400" />}>
                                <FormattedText text={analysis.atsFriendliness} listStyle="circle" />
                            </InfoCard>
                            <InfoCard variant="dark" title="Overall Feedback" icon={<ChatBubbleIcon className="w-5 h-5 text-cyan-400" />}>
                                <FormattedText text={analysis.overallFeedback} />
                            </InfoCard>
                        </div>
                        
                        {/* Fourth Row: Keyword Analysis */}
                        <div className="grid grid-cols-1 gap-6">
                            <InfoCard
                                variant="light"
                                title="Keyword Analysis"
                                icon={<KeyIcon className="w-5 h-5 text-purple-400" />}
                            >
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-200 mb-3 border-b border-slate-700/50 pb-2">
                                        Keywords from Job Description
                                    </h4>
                                    {analysis.jdKeywords && analysis.jdKeywords.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {analysis.jdKeywords.map((keyword, index) => (
                                                <span key={`jd-kw-${index}`} className="bg-slate-700/80 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic text-xs pt-2">No specific keywords were extracted.</p>
                                    )}
                                </div>
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-slate-200 mb-3 border-b border-slate-700/50 pb-2">
                                        Keywords Missing from Your Resume
                                    </h4>
                                    {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {analysis.missingKeywords.map((keyword, index) => (
                                                <span key={`missing-kw-${index}`} className="bg-red-900/40 text-red-300 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-red-500/30">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic text-xs pt-2">Great job! No critical keywords seem to be missing.</p>
                                    )}
                                </div>
                            </InfoCard>
                        </div>

                    </div>

                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzerView;
