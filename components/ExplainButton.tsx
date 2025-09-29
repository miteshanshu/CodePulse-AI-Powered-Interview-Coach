/**
 * @fileoverview A small, reusable button component that triggers the "Explain This" feature.
 * When clicked, it passes its `text` prop to the global AppContext, which then
 * signals the `App` component to switch to the "Doubt Buster" tab and process the text.
 * @author Mitesh
 */

import React from 'react';
import { useAppContext } from '../contexts/AppContext';

// The question mark icon for the button.
const ExplainIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

/**
 * Renders a button that, when clicked, sends the associated text to the Doubt Buster feature.
 * @param {{ text: string }} props The text to be explained.
 */
const ExplainButton: React.FC<{ text: string }> = ({ text }) => {
    const { setTextToExplain } = useAppContext();

    const handleClick = (e: React.MouseEvent) => {
        // Prevent parent click events, such as toggling an accordion, from firing.
        e.stopPropagation(); 
        if (text) {
            setTextToExplain(text);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 p-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 backdrop-blur-sm"
            aria-label="Explain this"
            title="Explain this"
        >
            <ExplainIcon className="w-4 h-4" />
        </button>
    );
};

export default ExplainButton;
