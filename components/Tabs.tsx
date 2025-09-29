/**
 * @fileoverview The main sidebar navigation component for the application.
 * It displays a list of tabs, handles active states, and disables certain tabs
 * when the required data is not yet available.
 * @author Mitesh
 */

import React from 'react';
import type { Tab } from '../App';

interface SidebarProps {
  /** The currently active tab. */
  activeTab: Tab;
  /** Callback function to set the active tab. */
  setActiveTab: (tab: Tab) => void;
  /** A boolean indicating if data-dependent tabs should be disabled. */
  disabled: boolean;
}

/**
 * A list of tabs that should always be enabled, regardless of whether a prep kit
 * has been generated. These are the standalone tools.
 */
const ALWAYS_ENABLED_TABS: Tab[] = ["Home", "Mock Interview", "Dream Company", "Company Insights", "Resume Analyzer", "Doubt Buster", "User Manual"];

const CodePulseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M8 8.66667L4 12L8 15.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 8.66667L20 12L16 15.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.2 5.20001L10.8 18.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Defines the name and icon for each tab in the sidebar.
const tabLabels: {name: Tab, icon: React.FC<{className?: string}>}[] = [
    { name: "Home", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
    { name: "Q&A", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> },
    { name: "Practical Challenges", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" /></svg> },
    { name: "Mock Interview", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg> },
    { name: "Resume Analyzer", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>},
    { name: "Doubt Buster", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg> },
    { name: "Company Insights", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg> },
    { name: "Dream Company", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m-3.75 0h3.75m-3.75 0h3.75M12.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m-3.75 0h3.75" /></svg> },
    { name: "User Manual", icon: ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg> }
];

/**
 * Renders the responsive sidebar for navigating between different features of the app.
 * @param {SidebarProps} props The component's props.
 */
const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, disabled }) => {
  return (
    <aside className="w-16 md:w-64 bg-slate-950 border-r border-slate-800 p-2 md:p-3 flex flex-col gap-2">
       {/* App Logo and Title */}
       <div className="flex items-center gap-3 mb-6 p-2">
         <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-blue-400 flex-shrink-0">
            <CodePulseIcon className="w-6 h-6" />
         </div>
         <span className="hidden md:inline font-bold text-xl text-white whitespace-nowrap">CodePulse</span>
       </div>
      {tabLabels.map(({ name, icon: Icon }) => {
        const isActive = activeTab === name;
        // A tab is disabled if the global `disabled` prop is true AND it's not in the always-enabled list.
        const isDisabled = disabled && !ALWAYS_ENABLED_TABS.includes(name);

        return (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            disabled={isDisabled}
            className={`w-full flex items-center gap-3 text-left p-2 md:px-3 md:py-2.5 rounded-md transition-all duration-200 text-sm font-medium relative
              ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active tab indicator bar */}
            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-500 rounded-r-full"></div>}
            <Icon className="w-5 h-5 flex-shrink-0 md:ml-1" />
            {/* Show label only on wider screens */}
            <span className="hidden md:inline">{name}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;
