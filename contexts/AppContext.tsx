/**
 * @fileoverview Defines the global React Context for the application.
 * This context is used to manage state that needs to be shared across
 * deeply nested components, avoiding the need for "prop drilling".
 * Currently, it manages the text for the "Explain This" feature.
 * @author Mitesh
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

/** The shape of the application's global context. */
interface AppContextType {
    /** The text string that the user wants explained. Null if no request is active. */
    textToExplain: string | null;
    /** Function to set the text that needs to be explained. */
    setTextToExplain: (text: string | null) => void;
}

/** The React Context object. */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * The provider component that wraps the application and makes the context available
 * to all child components.
 * @param {object} props The component props.
 * @param {ReactNode} props.children The child components to render.
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State to hold the text that will be sent to the Doubt Buster.
    const [textToExplain, setTextToExplain] = useState<string | null>(null);

    const value = {
        textToExplain,
        setTextToExplain,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * A custom hook to easily access the AppContext from any functional component.
 * @returns {AppContextType} The application context value.
 * @throws Will throw an error if used outside of an AppProvider.
 */
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
