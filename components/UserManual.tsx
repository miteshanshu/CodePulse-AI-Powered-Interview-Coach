/**
 * @fileoverview A static component that displays the user manual for the application.
 * It uses the FormattedText component to render markdown-style content into a readable guide.
 * @author Mitesh
 */

import React from 'react';
import FormattedText from './FormattedText';

// The content of the user manual, written in a markdown-like format.
const manualContent = `
# Welcome to the CodePulse User Manual!

This guide will walk you through all the features of your personal AI interview coach.

## 1. Getting Started: The Prep Kit

Your journey begins on the **Home** tab where you can generate a full interview prep kit.

-   **Job Role:** Enter the job title you're preparing for (e.g., "Senior React Developer").
-   **Add Details (Optional):** For a more tailored kit, add the Job Description and your Resume.
-   **Generate Prep Kit:** Click this to create your kit. You'll be taken to the **Q&A** tab.

## 2. Your Personalized Prep Kit

Once generated, these tabs become available, filled with content tailored to your inputs.

### Q&A
Find AI-generated General/HR and Technical questions with high-quality model answers.

### Practical Challenges
This section contains hands-on problems, adapted for your role (tech or content).

**Pro Tip:** Use the **Refresh** button at the top of these tabs to get a completely new set of problems for the same role.

## 3. Powerful Standalone Tools

These features are always available, even without generating a prep kit.

### Mock Interview
Start an interactive, AI-powered mock interview at any time. Just go to the tab, enter a job role, and begin. The AI acts as a hiring manager, asking relevant questions and follow-ups.

### Resume Analyzer
Paste your resume and a job description to get a detailed **Analysis Dashboard**, including a Match Score, ATS feedback, and an AI-generated professional summary.

### Company Insights
Get an up-to-date research briefing on any company by using the search bar in this tab.

### Doubt Buster
Your go-to for any question, on any topic. Get clear, simple explanations for anything you're confused about.

### Dream Company
Generate a randomized set of questions and challenges for any job role and difficulty level (from Fresher to Senior) on the fly. This tool helps you practice for roles at top-tier companies by simulating interview questions based on your desired difficulty.

## 4. Special Features

### Explain This Feature
Throughout the app, you'll see a question mark icon next to questions, answers, code blocks, and paragraphs. Clicking this icon will send that specific piece of text to the **Doubt Buster** tab, where you can get a detailed explanation instantly. It's a quick way to dive deeper into any concept you're unsure about without losing your place.

### Export to PDF
Save your sessions for offline review. Look for the **Export PDF** button in the **Mock Interview**, **Doubt Buster**, and **Resume Analyzer** dashboards.
`;

/**
 * Renders the formatted user manual content.
 */
const UserManual: React.FC = () => {
    return (
        <div className="bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700/80 p-6 sm:p-8">
            <FormattedText text={manualContent} disableExplain={true} />
        </div>
    );
};

export default UserManual;
