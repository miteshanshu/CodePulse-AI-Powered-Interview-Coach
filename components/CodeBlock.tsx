/**
 * @fileoverview A feature-rich code block component.
 * It provides syntax highlighting via highlight.js, a copy-to-clipboard button,
 * an "Explain this" button, and is vertically resizable by the user.
 * @author Mitesh
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ExplainButton from './ExplainButton';

// Make hljs globally available from the script loaded in index.html.
declare var hljs: any;

interface CodeBlockProps {
  /** The code string to display. */
  code: string;
  /** The programming language for syntax highlighting (e.g., 'javascript', 'python'). */
  language: string;
}

// --- Icons ---
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);
const ResizeHandleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
// --- End Icons ---


/**
 * Renders a block of code with syntax highlighting, a copy button, and resizability.
 * @param {CodeBlockProps} props The component props.
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  // IMPORTANT: By giving the `<code>` element a `key`, we ensure React replaces the DOM node
  // when the language changes (e.g., switching between JS and Python solutions).
  // This prevents highlight.js from conflicting with React's virtual DOM, which was
  // causing a "black screen" flicker issue.
  const uniqueKey = useMemo(() => `${language}-${Math.random()}`, [language]);

  /**
   * Manually trigger highlight.js to apply syntax highlighting when the component updates.
   * This is necessary because we are using a non-React library to manipulate the DOM.
   */
  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
        try {
            hljs.highlightElement(codeRef.current);
        } catch (error) {
            console.error("Highlight.js error:", String(error));
        }
    }
  }, [code, language, uniqueKey]);

  /**
   * Copies the code content to the user's clipboard using the Clipboard API.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      // Reset the "Copied!" message after 2 seconds.
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', String(err));
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg ring-1 ring-slate-700 relative group shadow-lg">
      {/* Header bar for the code block */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800/60 border-b border-slate-700/50">
        <span className="text-xs font-semibold text-slate-400 uppercase font-sans tracking-wider">{language || 'Code'}</span>
        <div className="flex items-center gap-2">
            <ExplainButton text={code} />
            <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-md text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-sans"
            aria-label="Copy code"
            title="Copy code"
            >
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>
      </div>
      {/* Container that allows vertical resizing */}
      <div className="resize-y overflow-auto min-h-[150px] max-h-[500px] text-sm font-mono">
        <pre className="whitespace-pre-wrap">
          <code 
            key={uniqueKey}
            ref={codeRef}
            className={`language-${language} p-4 block`}
          >
            {code}
          </code>
        </pre>
      </div>
      {/* Resize handle icon in the bottom-right corner */}
      <div className="absolute bottom-1 right-1 text-slate-600 opacity-30 group-hover:opacity-100 transition-opacity cursor-se-resize pointer-events-none">
        <ResizeHandleIcon />
      </div>
    </div>
  );
};

export default CodeBlock;
