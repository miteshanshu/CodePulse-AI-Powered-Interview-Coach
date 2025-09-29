/**
 * @fileoverview A component to display error messages in a consistent, user-friendly format.
 * It optionally includes a "Try Again" button to re-trigger the failed action.
 * @author Mitesh
 */

import React from 'react';

interface ErrorMessageProps {
  /** The error message to display. */
  message: string;
  /** An optional callback function to execute when the "Try Again" button is clicked. */
  onRetry?: () => void;
}

/**
 * A functional component that renders a styled error message box.
 * @param {ErrorMessageProps} props The component props.
 * @returns {React.ReactElement} The rendered error message.
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative my-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" role="alert">
      <div>
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-xs font-bold text-slate-200 bg-slate-600/50 hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors"
          aria-label="Try Again"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
