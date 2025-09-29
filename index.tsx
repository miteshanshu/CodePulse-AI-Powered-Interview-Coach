/**
 * @fileoverview This is the main entry point for the CodePulse React application.
 * It sets up the React root, renders the main App component, and wraps it with the AppProvider for global state management.
 * @author Mitesh
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';

// Find the root DOM element where the React app will be mounted.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root and render the application.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* AppProvider manages global state, such as the text for the 'Doubt Buster'. */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
