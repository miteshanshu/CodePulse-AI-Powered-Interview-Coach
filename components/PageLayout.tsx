/**
 * @fileoverview A standard page layout component.
 * It provides a consistent structure with a scrolling main content area and a footer
 * for all views except the Home page.
 * @author Mitesh
 */

import React from 'react';
import Footer from './Footer';

/**
 * A wrapper component that provides a consistent layout for most pages.
 * @param {{ children: React.ReactNode }} props The component's props.
 */
const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
        <Footer />
    </div>
  );
};

export default PageLayout;
