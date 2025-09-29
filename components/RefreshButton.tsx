/**
 * @fileoverview A reusable button component specifically for refresh actions.
 * It includes a refresh icon and handles a loading state where the icon spins
 * and the button text changes.
 * @author Mitesh
 */

import React from 'react';

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992m0 0-3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183" />
    </svg>
);

interface RefreshButtonProps {
    /** The function to call when the button is clicked. */
    onClick: () => void;
    /** A boolean to indicate if the refresh action is in progress. */
    isLoading: boolean;
    /** The text or elements to display inside the button. */
    children: React.ReactNode;
    /** Optional additional CSS classes. */
    className?: string;
    /** Optional boolean to disable the button. */
    disabled?: boolean;
}

/**
 * Renders a button with a refresh icon and loading state.
 * @param {RefreshButtonProps} props The component's props.
 */
const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick, isLoading, children, className = '', disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`flex-shrink-0 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600/50 disabled:cursor-not-allowed text-slate-300 px-3 py-1.5 rounded-md text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-sans ${className}`}
            aria-label={String(children)}
            title={String(children)}
        >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : children}
        </button>
    );
};

export default RefreshButton;
