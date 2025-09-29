/**
 * @fileoverview A general-purpose chatbot feature called "Doubt Buster".
 * Full-screen responsive UI upgrade.
 * @author Mitesh
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from "@google/genai";
import { createChat, handleApiError } from '../services/geminiService';
import type { ChatMessage } from '../types';
import FormattedText from './FormattedText';
import { useAppContext } from '../contexts/AppContext';

// Make PDF generation libraries available on the window object.
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

// --- Icons and Indicators ---
const ThinkingIndicator: React.FC = () => (
    <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
    </div>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);

const UserIcon: React.FC = () => (
    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    </div>
);

const BotIcon: React.FC = () => (
    <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    </div>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

// --- DoubtBuster Component ---
const DoubtBuster: React.FC = () => {
    // --- State Management ---
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isThinking, setIsThinking] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    
    // Refs for DOM elements.
    const chatContentRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Global context for receiving text to explain.
    const { textToExplain, setTextToExplain } = useAppContext();

    // Prevent duplicate processing
    const processingExplanation = useRef(false);
    const lastProcessedMessage = useRef<string>('');

    /** Copy message to clipboard */
    const handleCopyMessage = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageIndex(index);
            setTimeout(() => setCopiedMessageIndex(null), 2000);
        } catch (error) {
            console.error("Failed to copy text:", String(error));
        }
    };

    /** Process AI Response (unchanged) */
    const processAIResponse = async (message: string, isRetry: boolean = false) => {
        if (!chat) return;
        if (!isRetry && message === lastProcessedMessage.current) return;
        if (!isRetry) lastProcessedMessage.current = message;
        if (isRetry) setMessages(prev => prev.slice(0, -1));

        setIsThinking(true);
        try {
            const result = await chat.sendMessageStream({ message });
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            for await (const chunk of result) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex].role === 'model' && !newMessages[lastIndex].isError) {
                        newMessages[lastIndex] = { ...newMessages[lastIndex], text: newMessages[lastIndex].text + chunk.text };
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            const friendlyError = handleApiError(error, 'DoubtBuster.processAIResponse');
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: `${friendlyError.message} Would you like to try that again?`,
                isError: true,
                onRetry: () => processAIResponse(message, true) 
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    /** Initialize chat */
    useEffect(() => {
        const startChat = async (chatInstance: Chat, isRetry: boolean = false) => {
            if (isRetry) setMessages([]);
            setIsThinking(true);
            try {
                const result = await chatInstance.sendMessageStream({ message: "Introduce yourself briefly and ask me what I'm confused about." });
                setMessages([{ role: 'model', text: '' }]);
                for await (const chunk of result) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastIndex = newMessages.length - 1;
                        if (newMessages[lastIndex].role === 'model' && !newMessages[lastIndex].isError) {
                            newMessages[lastIndex] = { ...newMessages[lastIndex], text: newMessages[lastIndex].text + chunk.text };
                        }
                        return newMessages;
                    });
                }
            } catch (error) {
                const friendlyError = handleApiError(error, 'DoubtBuster.startChat');
                setMessages([{
                    role: 'model',
                    text: `${friendlyError.message} Let's try again.`,
                    isError: true,
                    onRetry: () => startChat(chatInstance, true)
                }]);
            } finally { setIsThinking(false); }
        };

        const initChat = () => {
            setMessages([]);
          const systemInstruction = `
               You are 'Doubt Buster', a friendly and highly knowledgeable AI assistant. 
Your goal is to help users understand any concept clearly, using simple, natural Indian English. 
Always give examples relevant to everyday life in India, explain step-by-step, and anticipate possible doubts. 
Be patient, detailed, and polite. 
Avoid overly technical jargon; if technical terms are necessary, explain them clearly. 
Make your responses engaging, easy to read, and personalised, as if speaking directly to the user.  

**Your Core Directives:**
1. **Persona & Tone:** Maintain a friendly, professional, approachable, and conversational tone. Avoid generic or robotic replies. Act as a smart, helpful guide for learning and clarification.
2. **Language:** Use Indian English consistently. Follow Indian spellings and usage, e.g., realise, colour, centre, whilst. Speak naturally and professionally, like a smart friend.
   - You may switch your response language to Hindi, Hinglish, or Bhojpuri **only if the user specifically requests it**. Otherwise, always default to Indian English.
3. **Versatility:** Be ready to answer questions on any subject—science, history, daily life, creative ideas, etc.—with clarity.
4. **Clarity & Simplicity:** Break complex topics into easy-to-understand explanations. Keep answers clear and concise.
5. **Use Examples:** Use relatable examples or analogies, especially from Indian life, to reinforce understanding.
6. **Introduction:** Always provide a brief, welcoming introduction, stating clearly that you can help with any question.
7. **Engagement:** Encourage curiosity by suggesting related ideas or asking gentle follow-up questions naturally, without forcing them.
8. **Honesty:** Admit if you do not know an answer rather than guessing. Suggest reliable sources for further information.
9. **Formatting:** Use headings, bullet points, and line breaks to make detailed explanations easy to read.
10. **Adaptability:** Match the user’s tone—slightly casual if they are casual, formal if they are formal. Stay flexible and human-like.
11. **Cultural Awareness:** Use Indian context for examples, such as festivals, food, history, or daily routines, where it helps understanding.
12. **Entertainment Discussion:** Be ready to discuss movies, web series, or shows. Offer recommendations, reviews, or insights in a friendly and engaging way.
`;
            try {
                const newChat = createChat({ model: 'gemini-2.5-flash', config: { systemInstruction } });
                setChat(newChat);
                return newChat;
            } catch (error) {
                const friendlyError = handleApiError(error, 'DoubtBuster.initChat');
                setMessages([{ role: 'model', text: `Apologies, I can't seem to get started due to a configuration issue: ${friendlyError.message}`, isError: true }]);
                setIsThinking(false);
                return null;
            }
        };

        const chatInstance = initChat();
        if (chatInstance && !textToExplain) startChat(chatInstance);
    }, []);

    /** Handle "Explain This" feature */
    useEffect(() => {
        if (textToExplain && chat && !processingExplanation.current) {
            processingExplanation.current = true;
            const prompt = `Can you please explain the following clearly?\n\n---\n${textToExplain}\n---`;
            const newUserMessage: ChatMessage = { role: 'user', text: prompt };
            setMessages(prev => [...prev, newUserMessage]);
            processAIResponse(prompt).finally(() => { processingExplanation.current = false; });
            setTextToExplain(null);
        }
    }, [textToExplain, chat, setTextToExplain]);

    /** Auto-scroll */
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isThinking]);

    /** Send user message */
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isThinking || !chat) return;
        const newUserMessage: ChatMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        await processAIResponse(newUserMessage.text);
    };

    /** Export chat to PDF */
    const handleExportPdf = async () => {
        if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') return;
        const chatContent = chatContentRef.current;
        if (!chatContent) return;
        setIsExporting(true);

        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(chatContent, { scale: 2, backgroundColor: '#1e293b', useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

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

            pdf.save('doubt-buster-chat.pdf');
        } catch (error) {
            console.error("Failed to export PDF:", String(error));
        } finally { setIsExporting(false); }
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-slate-900 text-white">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Doubt Buster</h2>
                    <p className="text-sm text-slate-400">Your friendly guide for any question you have.</p>
                </div>
                <button
                    onClick={handleExportPdf}
                    disabled={isExporting || messages.length === 0}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600/50 px-4 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-sans"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
            </div>

            {/* Chat content */}
            <div ref={chatContentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <BotIcon />}
                        <div className={`max-w-2xl p-4 rounded-2xl ${msg.role === 'model' ? (msg.isError ? 'bg-red-500/20 border border-red-500/30 text-red-300 rounded-bl-md' : 'bg-slate-700 rounded-bl-md') : 'bg-blue-600 text-white rounded-br-md'}`}>
                            <FormattedText text={msg.text} disableExplain={true} />
                            {msg.role === 'model' && (
                                <div className="mt-3 pt-3 border-t border-slate-600/30 flex justify-between items-center">
                                    {msg.isError && msg.onRetry ? (
                                        <button onClick={msg.onRetry} className="text-xs font-bold text-slate-200 bg-slate-600/50 hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors">Retry</button>
                                    ) : <div></div>}
                                    <button onClick={() => handleCopyMessage(msg.text, idx)} className="text-xs font-bold text-slate-200 bg-slate-600/50 hover:bg-slate-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
                                        <CopyIcon className="w-4 h-4" /> {copiedMessageIndex === idx ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            )}
                        </div>
                        {msg.role === 'user' && <UserIcon />}
                    </div>
                ))}
                {isThinking && messages.length > 0 && !messages[messages.length - 1].isError && (
                    <div className="flex items-start gap-4">
                        <BotIcon />
                        <div className="max-w-2xl p-4 rounded-lg bg-slate-700">
                            <ThinkingIndicator />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <div className="p-5 border-t border-slate-700 bg-slate-800/70 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        disabled={isThinking}
                    />
                    <button type="submit" disabled={isThinking || !userInput.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-4 rounded-full transition transform hover:scale-110 disabled:scale-100">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoubtBuster;
