/**
 * @fileoverview A fully interactive, AI-powered mock interview feature.
 * It provides a setup screen for users to input their job role details, followed by
 * a chat interface where an AI interviewer asks questions and responds to answers.
 * The entire chat transcript can be exported as a PDF.
 * @author Mitesh
 */


import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from "@google/genai";
import { createChat, handleApiError } from '../services/geminiService';
import type { ChatMessage } from '../types';
import FormattedText from './FormattedText';

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
const StartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
);
const ThinkingIndicator: React.FC = () => (
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);
const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    </div>
);
const BotIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
        </svg>
    </div>
);
// --- End Icons ---

// Make PDF generation libraries (loaded in index.html) available on the window object.
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

const MockInterview: React.FC = () => {
    // --- State Management ---
    // UI state: controls whether the setup screen or the interview chat is shown.
    const [interviewStarted, setInterviewStarted] = useState(false);

    // Input state for the setup form.
    const [jobRoleInput, setJobRoleInput] = useState('');
    const [jobDescriptionInput, setJobDescriptionInput] = useState('');
    const [resumeInput, setResumeInput] = useState('');
    const [showOptional, setShowOptional] = useState(false);
    
    // Stores the details for the currently active interview session.
    const [currentInterviewDetails, setCurrentInterviewDetails] = useState<{ jobRole: string; jobDescription: string; resume: string } | null>(null);
    
    // Chat-specific state.
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Refs for DOM elements.
    const chatContentRef = useRef<HTMLDivElement>(null); // Used for PDF export.
    const chatEndRef = useRef<HTMLDivElement>(null); // Used for auto-scrolling.

    // Add refs to prevent duplicate processing
    const processingMessage = useRef(false);
    const lastProcessedMessage = useRef<string>('');

    /**
     * Processes a message from the user, sends it to the AI, and streams the response.
     * @param {string} message The user's message to send.
     * @param {boolean} [isRetry=false] - Whether this is a retry of a failed message.
     */
    const processAIResponse = async (message: string, isRetry: boolean = false) => {
        if (!chat) return;

        // Prevent duplicate processing of same message
        if (!isRetry && message === lastProcessedMessage.current) {
            return;
        }
        if (!isRetry && processingMessage.current) {
            return; // Already processing a message
        }
        if (!isRetry) {
            lastProcessedMessage.current = message;
            processingMessage.current = true;
        }

        // If retrying, remove the previous error message.
        if (isRetry) {
            setMessages(prev => prev.slice(0, -1));
        }

        setIsThinking(true);
        
        try {
            const result = await chat.sendMessageStream({ message });
            
            // Add a new, empty model message to the state to stream content into.
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            // Append each chunk of the AI's response to the last message.
            for await (const chunk of result) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessageIndex = newMessages.length - 1;
                    const lastMessage = newMessages[lastMessageIndex];
                    if (lastMessage.role === 'model' && !lastMessage.isError) {
                        newMessages[lastMessageIndex] = {
                            ...lastMessage,
                            text: lastMessage.text + chunk.text
                        };
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            const friendlyError = handleApiError(error, 'MockInterview.processAIResponse');
            // Add an error message to the chat with a retry button.
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: `${friendlyError.message} Would you like to retry sending your last message?`,
                isError: true,
                onRetry: () => processAIResponse(message, true) 
            }]);
        } finally {
            setIsThinking(false);
            if (!isRetry) {
                processingMessage.current = false;
            }
        }
    };

    /**
     * Initializes the chat session when the interview starts.
     * It sets up the system instruction for the AI and sends the initial message.
     */
    useEffect(() => {
        const startInterview = async (chatInstance: Chat, isRetry: boolean = false) => {
            if (processingMessage.current && !isRetry) {
                return; // Already processing
            }
            processingMessage.current = true;

            if (isRetry) {
                setMessages([]);
            }
            setIsThinking(true);
            try {
                // The first message to the AI to kick off the conversation.
                const result = await chatInstance.sendMessageStream({ message: "Start the interview." });
                setMessages([{ role: 'model', text: '' }]);
                for await (const chunk of result) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessageIndex = newMessages.length - 1;
                        const lastMessage = newMessages[lastMessageIndex];
                        if (lastMessage && lastMessage.role === 'model' && !lastMessage.isError) {
                            newMessages[lastMessageIndex] = {
                                ...lastMessage,
                                text: lastMessage.text + chunk.text
                            };
                        }
                        return newMessages;
                    });
                }
            } catch (error) {
                const friendlyError = handleApiError(error, 'MockInterview.startInterview');
                setMessages([{
                    role: 'model',
                    text: `${friendlyError.message} Let's try again.`,
                    isError: true,
                    onRetry: () => startInterview(chatInstance, true)
                }]);
            } finally {
                setIsThinking(false);
                processingMessage.current = false;
            }
        };

        const initChat = () => {
            if (!currentInterviewDetails) return;
            if (processingMessage.current) {
                return; // Already initializing
            }

            const { jobRole, jobDescription, resume } = currentInterviewDetails;

            setMessages([]);
            const jdContext = jobDescription ? `The job description is: "${jobDescription}"` : "No job description was provided.";
            const resumeContext = resume ? `The candidate's resume is: "${resume}"` : "No resume was provided.";

            // This detailed system instruction defines the AI's persona, rules, and context.
            const systemInstruction = `
                You are an expert interviewer from 'CodePulse' named Mitesh. Your goal is to conduct a realistic and professional mock interview. Maintain a conversational and engaging tone throughout.

                **Candidate's Details:**
                - **Role:** "${jobRole}"
                - **Job Description:** ${jdContext}
                - **Candidate's Resume:** ${resumeContext}

                **Interview Protocol:**
                1.  **Introduction:** Begin with a brief, friendly introduction. Acknowledge the role they are interviewing for.
                2.  **One Question at a Time:** Ask only one question at a time and wait for the user's response before asking the next one.
                3.  **Personalized, Role-Aware Questions:**
                    - Use the provided resume and/or job description to ask highly specific and relevant questions.
                    - For **tech roles**, ask about projects, architecture, algorithms. E.g., "Your resume mentions a project using React... can you walk me through it?"
                    - For **content writer roles**, ask about their portfolio, writing process, experience with SEO tools, or content strategy. E.g., "I see you've written for the B2B tech space. Can you describe your process for researching and writing a technical blog post?"
                    - If no resume or JD is provided, conduct a general but thorough interview for the specified role.
                4.  **Dynamic Follow-ups:** Based on the candidate's answers, ask relevant follow-up questions to dig deeper into their experience. This makes the interview feel more natural and less like a scripted Q&A.
                5.  **Realistic Flow:** Mix behavioral, technical/role-specific, and situational questions as a real interviewer would. The interview should last for about 5-7 main questions, not including follow-ups.
                6.  **No Soliciting Information:** **Crucially, do not ask the user to provide their resume or a job description.** Use only the information provided in this prompt. Do not mention that more details would be helpful.
                7.  **Provide Feedback:** After a few questions, offer brief, constructive feedback like "Thanks for sharing that, it gives me a good sense of your problem-solving skills."
                8.  **Conclusion:** Conclude the interview professionally. Thank the candidate for their time, provide a brief, positive summary of their performance, and wish them luck in their job search.
            `;
            
            try {
                const newChat = createChat({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction },
                });
                setChat(newChat);
                startInterview(newChat);
            } catch (error) {
                const friendlyError = handleApiError(error, 'MockInterview.initChat');
                setMessages([{
                    role: 'model',
                    text: `I'm sorry, I couldn't start the interview due to a configuration issue: ${friendlyError.message}`,
                    isError: true,
                }]);
                setIsThinking(false);
                processingMessage.current = false;
            }
        };
        
        // This effect runs when `currentInterviewDetails` is set, triggering the chat initialization.
        if (currentInterviewDetails) {
            initChat();
        }
    }, [currentInterviewDetails]);

    /**
     * Effect to automatically scroll to the bottom of the chat window
     * as new messages are added.
     */
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    /**
     * Handles the form submission for sending a user message.
     * @param {React.FormEvent} e The form event.
     */
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isThinking || !chat || processingMessage.current) return;

        const messageToSend = userInput;
        const newUserMessage: ChatMessage = { role: 'user', text: messageToSend };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        
        await processAIResponse(messageToSend);
    };

    /**
     * Handles exporting the chat transcript to a PDF file using jsPDF and html2canvas.
     */
    const handleExportPdf = async () => {
        if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
            console.error("PDF generation libraries are not loaded.");
            return;
        }

        const chatContent = chatContentRef.current;
        if (!chatContent) return;

        setIsExporting(true);

        try {
            const { jsPDF } = window.jspdf;
            // Use html2canvas to render the chat content onto a canvas.
            const canvas = await window.html2canvas(chatContent, {
                scale: 2, // Higher scale for better quality
                backgroundColor: '#1e293b', // Match the chat background
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            // Calculate dimensions to fit the image on the PDF pages.
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / pdfWidth;
            const scaledHeight = imgHeight / ratio;

            let heightLeft = scaledHeight;
            let position = 0;

            // Add the first page.
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;

            // Add more pages if the content is taller than one page.
            while (heightLeft > 0) {
                position = heightLeft - scaledHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('mock-interview-chat.pdf');
        } catch (error) {
            console.error("Failed to export PDF:", String(error));
        } finally {
            setIsExporting(false);
        }
    };
    
    /**
     * Handles the submission of the interview setup form.
     * @param {React.FormEvent} e The form event.
     */
    const handleStartInterview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobRoleInput.trim()) return;
        setCurrentInterviewDetails({
            jobRole: jobRoleInput,
            jobDescription: jobDescriptionInput,
            resume: resumeInput,
        });
        setInterviewStarted(true);
    };

    /**
     * Resets the entire component state to start a new interview from scratch.
     */
    const handleResetInterview = () => {
        setInterviewStarted(false);
        setCurrentInterviewDetails(null);
        setChat(null);
        setMessages([]);
        setIsThinking(false);
        processingMessage.current = false;
        lastProcessedMessage.current = '';
    };

    // Render the setup screen if the interview hasn't started yet.
    if (!interviewStarted) {
        return (
            <div className="h-full flex flex-col bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80 overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Start a Mock Interview</h2>
                    <p className="text-sm text-slate-400">Enter a job role to begin your practice session.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
                    <form onSubmit={handleStartInterview} className="w-full max-w-xl mx-auto space-y-6">
                        <div>
                           <label htmlFor="job-role-mock" className="block text-sm font-medium text-slate-300 mb-2">Job Role</label>
                            <input
                                id="job-role-mock"
                                type="text"
                                value={jobRoleInput}
                                onChange={(e) => setJobRoleInput(e.target.value)}
                                placeholder="e.g., Senior Product Manager"
                                className="w-full bg-slate-900/70 border border-slate-700 text-slate-200 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                            />
                        </div>
                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={() => setShowOptional(!showOptional)}
                                className="flex items-center gap-2 text-sm font-medium text-slate-300 border border-slate-600 hover:bg-slate-700/50 px-4 py-2 rounded-lg transition"
                                title={showOptional ? "Hide optional details" : "Add Job Description and Resume for a more tailored interview"}
                            >
                                {showOptional ? (
                                    <>
                                        <MinusIcon className="w-5 h-5" />
                                        <span>Hide Optional Details</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-5 h-5" />
                                        <span>Add Optional Details</span>
                                    </>
                                )}
                            </button>
                        </div>
                         {showOptional && (
                            <div className="space-y-6 fade-in">
                                <div>
                                    <label htmlFor="jd-mock" className="block text-sm font-medium text-slate-300 mb-2">Job Description (Optional)</label>
                                    <textarea
                                        id="jd-mock"
                                        value={jobDescriptionInput}
                                        onChange={(e) => setJobDescriptionInput(e.target.value)}
                                        placeholder="Paste the job description here..."
                                        rows={5}
                                        className="w-full bg-slate-900/70 border border-slate-700 text-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="resume-mock" className="block text-sm font-medium text-slate-300 mb-2">Your Resume (Optional)</label>
                                    <textarea
                                        id="resume-mock"
                                        value={resumeInput}
                                        onChange={(e) => setResumeInput(e.target.value)}
                                        placeholder="Paste your resume contents here..."
                                        rows={5}
                                        className="w-full bg-slate-900/70 border border-slate-700 text-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="pt-4 flex justify-center">
                            <button
                                type="submit"
                                disabled={!jobRoleInput.trim()}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg shadow-blue-600/20"
                            >
                                <StartIcon className="w-5 h-5" />
                                Start Interview
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    // Render the chat interface if the interview has started.
    return (
        <div className="h-full flex flex-col bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
                <div>
                    <h2 className="text-xl font-bold text-white">Mock Interview</h2>
                    <p className="text-sm text-slate-400">Practice for the "{currentInterviewDetails?.jobRole}" role.</p>
                </div>
                <div className="flex items-center gap-2">
                     <button
                        onClick={handleResetInterview}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-md text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-sans"
                        aria-label="Start New Interview"
                        title="Start New Interview"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992m0 0-3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183" /></svg>
                        New Interview
                    </button>
                    <button
                        onClick={handleExportPdf}
                        disabled={isExporting || messages.length === 0}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600/50 disabled:cursor-not-allowed text-slate-300 px-3 py-1.5 rounded-md text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-sans"
                        aria-label="Export chat to PDF"
                        title="Export chat to PDF"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>
            {/* The main chat content area */}
            <div ref={chatContentRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <BotIcon />}
                        <div className={`max-w-xl p-3.5 rounded-2xl ${msg.role === 'model' ? (msg.isError ? 'bg-red-500/20 border border-red-500/30 text-red-300 rounded-bl-md' : 'bg-slate-700 rounded-bl-md') : 'bg-blue-600 text-white rounded-br-md'}`}>
                           <FormattedText text={msg.text} />
                           {msg.isError && msg.onRetry && (
                               <div className="mt-3 pt-3 border-t border-red-500/30">
                                   <button 
                                       onClick={msg.onRetry}
                                       className="text-xs font-bold text-slate-200 bg-slate-600/50 hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors"
                                       aria-label="Retry sending message"
                                   >
                                       Retry
                                   </button>
                               </div>
                           )}
                        </div>
                        {msg.role === 'user' && <UserIcon />}
                    </div>
                ))}
                 {isThinking && messages.length > 0 && !messages[messages.length-1].isError && (
                     <div className="flex items-start gap-3">
                         <BotIcon />
                         <div className="max-w-xl p-3.5 rounded-lg bg-slate-700">
                             <ThinkingIndicator />
                         </div>
                     </div>
                 )}
                {/* Empty div to which we can scroll */}
                <div ref={chatEndRef} />
            </div>
            {/* Chat input form */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your answer here..."
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white"
                        disabled={isThinking}
                        aria-label="Your answer"
                    />
                    <button type="submit" disabled={isThinking || !userInput.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition transform hover:scale-110 disabled:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Send answer" title="Send answer">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MockInterview;