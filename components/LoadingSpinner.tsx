/**
 * @fileoverview A simple, reusable loading spinner component.
 * It's displayed whenever an asynchronous operation (like an API call) is in progress.
 * @author Mitesh
 */

import React from 'react';

/**
 * A functional component that renders a spinning animation.
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
