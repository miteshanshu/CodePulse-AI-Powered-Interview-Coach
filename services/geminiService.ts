/**
 * @fileoverview This service encapsulates all interactions with the Google Gemini API.
 * It defines JSON schemas for expected AI model outputs and provides functions to generate
 * various types of content required by the application, such as interview prep kits,
 * company insights, and resume analysis. It also handles error management for API calls.
 * @author Mitesh
 */

import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { FullInterviewPrep, RandomizedPrepSet, MachineCodingSolution, CompanyInsights, GroundingSource, ResumeAnalysis, RoleCategory, DifficultyLevel } from '../types';

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * This prevents the app from crashing on startup if the API key is missing.
 * @returns {GoogleGenAI} The initialized AI client.
 * @throws Will throw an error if the API_KEY environment variable is not configured.
 */
const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }

    // Get API key from Vite's configured environment variables
    const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        throw new Error("API_KEY is not configured. Please ensure GEMINI_API_KEY is set in your .env file.");
    }

    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
};

/**
 * A centralized error handler for Gemini API calls.
 * It inspects the error and returns a more user-friendly and specific error message.
 * @param {unknown} error - The caught error object.
 * @param {string} context - A string describing the context where the error occurred.
 * @returns {Error} A new Error object with a user-friendly message.
 */
export const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Error in ${context}:`, error);

    let errorMessage = "The AI is currently unavailable. Please try again in a moment.";

    if (error instanceof Error && error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('api key not valid')) {
            errorMessage = 'Invalid API key. Please check your Google AI API key configuration.';
        } else if (msg.includes('quota') || msg.includes('429')) {
            errorMessage = 'API quota exceeded. Please try again later or check your billing status.';
        } else if (msg.includes('400')) {
            errorMessage = 'Invalid request. Please check your input and try again.';
        } else if (msg.includes('500') || msg.includes('503')) {
            errorMessage = 'AI service temporarily unavailable. Please try again later.';
        } else if (msg.includes('safety')) {
            errorMessage = 'Request blocked by safety filters. Please modify your input.';
        } else {
            errorMessage = `Unexpected error: ${error.message}`;
        }
    }
    
    return new Error(errorMessage);
};

// --- Unique Content Generation Utilities ---

/**
 * Generates unique identifiers for each request to prevent caching
 */
const generateUniqueMarkers = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const sessionMarker = `${timestamp}-${randomId}`;
    
    return {
        sessionMarker,
        diversitySeeds: [
            `Alpha-${randomId}`,
            `Beta-${timestamp}`,
            `Gamma-${Math.floor(Math.random() * 10000)}`,
            `Delta-${Date.now() % 10000}`,
            `Epsilon-${randomId.slice(0, 5)}`
        ]
    };
};

/**
 * Creates varied prompt prefixes to force different thinking patterns
 */
const getVariedPromptPrefixes = () => {
    const prefixes = [
        "You are an innovative CodePulse interview strategist specializing in creative assessment techniques.",
        "As CodePulse's senior interview architect, you design cutting-edge evaluation frameworks.",
        "You are CodePulse's expert talent evaluator focused on comprehensive skill assessment.",
        "Acting as CodePulse's advanced interview design specialist, you create unique evaluation experiences.",
        "You are CodePulse's master interview coach, known for developing distinctive preparation methodologies."
    ];
    
    return prefixes[Math.floor(Math.random() * prefixes.length)];
};

/**
 * Generates context variation patterns
 */
const getContextualVariations = (baseContext: string) => {
    const variations = [
        `Context Analysis Phase: ${baseContext}`,
        `Strategic Assessment Framework: ${baseContext}`,
        `Evaluation Design Context: ${baseContext}`,
        `Interview Preparation Scope: ${baseContext}`,
        `Assessment Strategy Context: ${baseContext}`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
};

// --- JSON Schemas for Gemini API ---

/** Schema for a single question-answer pair */
const questionItemSchema = { 
    type: Type.OBJECT, 
    properties: { 
        question: { type: Type.STRING }, 
        answer: { type: Type.STRING, description: "A well-structured, professional answer using markdown formatting." } 
    },
    required: ["question", "answer"],
};

/** Schema for a system design question */
const systemDesignQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        answer: { type: Type.STRING, description: "A detailed answer using markdown formatting with headers and bullet points." }
    },
    required: ["question", "answer"],
};

/** Schema for general and technical questions */
const questionsSchema = {
    type: Type.OBJECT,
    properties: {
        generalQuestions: {
            type: Type.ARRAY,
            description: "5 general/HR questions with professional answers.",
            items: questionItemSchema
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "5 technical or role-specific questions with detailed answers.",
            items: questionItemSchema
        },
    },
    required: ["generalQuestions", "technicalQuestions"],
};

/** Schema for coding challenges */
const codingChallengesSchema = {
    type: Type.ARRAY,
    description: "2-3 practical coding or writing challenges with solutions.",
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            problem: { type: Type.STRING, description: "Detailed problem description with markdown formatting." },
            examples: { type: Type.STRING, description: "Clear examples with proper formatting." },
            solutions: {
                type: Type.OBJECT,
                properties: {
                    javascript: { type: Type.STRING },
                    python: { type: Type.STRING },
                    java: { type: Type.STRING },
                    cpp: { type: Type.STRING }
                },
                required: ["javascript", "python", "java", "cpp"],
            }
        },
        required: ["title", "problem", "examples", "solutions"],
    }
};

/** Schema for machine coding problems */
const machineCodingSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        problem: { type: Type.STRING, description: "Detailed project description with requirements in markdown format." },
    },
    required: ["title", "problem"],
};

/** Schema for system design questions array */
const systemDesignQuestionsSchema = {
    type: Type.ARRAY,
    description: "2-3 system design or strategic questions with detailed answers.",
    items: systemDesignQuestionSchema
};

/** Schema for machine coding solution guide */
const machineCodingSolutionSchema = {
    type: Type.OBJECT,
    properties: {
        solutionGuide: { 
            type: Type.STRING, 
            description: "Step-by-step solution guide with markdown formatting." 
        }
    },
    required: ["solutionGuide"],
};

/** Schema for resume analysis */
const resumeAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.NUMBER,
            description: "Match score from 0-100."
        },
        atsFriendliness: {
            type: Type.STRING,
            description: "ATS compatibility assessment with bullet points."
        },
        resumeSummary: {
            type: Type.STRING,
            description: "Professional summary tailored to the job (no quotation marks)."
        },
        overallFeedback: {
            type: Type.STRING,
            description: "Concise alignment summary."
        },
        strengths: {
            type: Type.STRING,
            description: "Bulleted list of strengths with bold titles."
        },
        improvementSuggestions: {
            type: Type.STRING,
            description: "Bulleted list of improvements with bold titles."
        },
        jdKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        missingKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
    },
    required: ["matchScore", "atsFriendliness", "resumeSummary", "overallFeedback", "strengths", "improvementSuggestions", "jdKeywords", "missingKeywords"],
};

// --- Service Functions ---

/**
 * Helper function to call Gemini API and parse JSON response
 * Uses multiple strategies to prevent duplication
 */
const generateAndParse = async (prompt: string, schema: any, maxRetries = 2, contextId?: string): Promise<any> => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const client = getAiClient();
            
            // Generate unique configuration for each call
            const uniqueConfig = {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.9 + (Math.random() * 0.3), // Random between 0.9-1.2
                topP: 0.85 + (Math.random() * 0.1), // Random between 0.85-0.95
                topK: Math.floor(Math.random() * 20) + 30, // Random between 30-50
            };
            
            const response = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ text: prompt }],
                config: uniqueConfig,
            });

            if (!response.text) {
                throw new Error("Empty response from AI service");
            }

            const jsonText = response.text.trim();
            
            // Validate JSON before parsing
            if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
                throw new Error("Invalid JSON response format");
            }

            return JSON.parse(jsonText);

        } catch (error) {
            lastError = error as Error;
            console.warn(`API call attempt ${attempt} failed:`, error);
            
            if (attempt === maxRetries) {
                break;
            }
            
            // Exponential backoff with jitter
            const delay = (1000 * attempt) + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw handleApiError(lastError, `generateAndParse (${maxRetries} attempts)`);
};

/**
 * Determines if a job role is 'tech' or 'content' based on keywords
 */
const getRoleCategory = (jobRole: string): RoleCategory => {
    const contentKeywords = ['writer', 'content', 'editor', 'copywriter', 'author', 'writing', 'marketing', 'copywriting'];
    const lowerJobRole = jobRole.toLowerCase();
    return contentKeywords.some(kw => lowerJobRole.includes(kw)) ? 'content' : 'tech';
};

/**
 * Generates a complete interview prep kit with anti-duplication measures
 */
export const generateFullInterviewPrep = async (
    jobRole: string, 
    jobDescription?: string, 
    resume?: string
): Promise<FullInterviewPrep> => {
    if (!jobRole?.trim()) {
        throw new Error("Job role is required");
    }

    const roleCategory = getRoleCategory(jobRole);
    const { sessionMarker, diversitySeeds } = generateUniqueMarkers();
    
    const contextInfo = [
        `Job Role: ${jobRole}`,
        `Role Category: ${roleCategory}`,
        `Session: ${sessionMarker}`,
        jobDescription?.trim() ? `Job Description: ${jobDescription}` : '',
        resume?.trim() ? `Resume Context: ${resume}` : ''
    ].filter(Boolean).join('\n\n');

    // Create completely different prompts for each section
    const questionsPrompt = `${getVariedPromptPrefixes()}

UNIQUE CONTENT GENERATION REQUIREMENTS:
- Generate completely original and distinct questions
- Avoid any repetitive patterns or similar phrasing
- Each question should explore different aspects and scenarios
- Diversity Seed: ${diversitySeeds[0]}

${getContextualVariations(contextInfo)}

Create exactly 5 unique general/HR interview questions and 5 unique ${roleCategory === 'tech' ? 'technical' : 'role-specific'} questions with professional answers.

SPECIFIC REQUIREMENTS FOR UNIQUENESS:
- General questions should cover: career motivation, problem-solving approach, team dynamics, professional growth, company alignment
- ${roleCategory === 'tech' ? 'Technical questions should span: system design, algorithms, coding best practices, architecture decisions, debugging scenarios' : 'Role-specific questions should cover: content strategy, writing processes, audience engagement, creative problem-solving, project management'}
- Each answer should be 150-300 words with distinct examples and insights
- Use varied sentence structures and professional vocabulary throughout`;

    const challengesPrompt = `${getVariedPromptPrefixes()}

CHALLENGE GENERATION WITH MAXIMUM DIVERSITY:
- Create entirely original ${roleCategory === 'content' ? 'writing challenges' : 'coding challenges'} 
- Each challenge must be fundamentally different in approach and scope
- Diversity Seed: ${diversitySeeds[1]}

${getContextualVariations(contextInfo)}

Generate 2-3 completely unique ${roleCategory === 'content' ? 'writing challenges for content professionals' : 'coding challenges appropriate for the role'}.

UNIQUENESS REQUIREMENTS:
${roleCategory === 'content' ? 
`- Challenge 1: Creative writing task (blog post, marketing copy, etc.)
- Challenge 2: Technical writing or documentation task  
- Challenge 3: Strategic content planning exercise
- For solutions, place writing samples ONLY in 'javascript' field, set others to 'N/A'` :
`- Challenge 1: Algorithm/data structure problem
- Challenge 2: System design or architecture challenge
- Challenge 3: Real-world application scenario
- Provide complete solutions in all four languages`}
- Each challenge should test different competencies and skill sets`;

    const machineCodingPrompt = `${getVariedPromptPrefixes()}

PROJECT DESIGN WITH COMPLETE ORIGINALITY:
- Design a comprehensive, unique ${roleCategory === 'content' ? 'content project' : 'machine coding project'}
- Avoid common or typical project patterns
- Diversity Seed: ${diversitySeeds[2]}

${getContextualVariations(contextInfo)}

Create one comprehensive ${roleCategory === 'content' ? 'content creation project' : 'machine coding project'} that stands out from typical interview questions.

ORIGINALITY REQUIREMENTS:
- Choose an innovative problem domain or use case
- Include specific, realistic requirements and constraints  
- Define clear deliverables and success criteria
- Incorporate modern technologies and best practices
- Make it relevant to real-world business scenarios`;

    try {
        // Sequential calls with longer delays to ensure uniqueness
        const questionsResult = await generateAndParse(questionsPrompt, questionsSchema, 2, 'questions');
        
        // Wait 2 seconds between calls
        await new Promise(resolve => setTimeout(resolve, 2000));
        const codingChallengesResult = await generateAndParse(challengesPrompt, codingChallengesSchema, 2, 'challenges');
        
        // Wait another 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        const machineCodingResult = await generateAndParse(machineCodingPrompt, machineCodingSchema, 2, 'machine');

        return {
            roleCategory,
            generalQuestions: questionsResult.generalQuestions || [],
            technicalQuestions: questionsResult.technicalQuestions || [],
            codingChallenges: codingChallengesResult || [],
            machineCoding: machineCodingResult || {},
        };

    } catch (error) {
        throw handleApiError(error, 'generateFullInterviewPrep');
    }
};

/**
 * Generates a randomized practice set with enhanced diversity
 */
export const generateRandomizedPrepSet = async (
    jobRole: string, 
    difficulty: DifficultyLevel, 
    jobDescription?: string, 
    resume?: string
): Promise<RandomizedPrepSet> => {
    if (!jobRole?.trim()) {
        throw new Error("Job role is required");
    }

    const roleCategory = getRoleCategory(jobRole);
    const { sessionMarker, diversitySeeds } = generateUniqueMarkers();
    
    const contextInfo = [
        `Job Role: ${jobRole}`,
        `Difficulty: ${difficulty}`,
        `Role Category: ${roleCategory}`,
        `Session: ${sessionMarker}`,
        jobDescription?.trim() ? `Job Description: ${jobDescription}` : '',
        resume?.trim() ? `Resume Context: ${resume}` : ''
    ].filter(Boolean).join('\n\n');

    const questionsPrompt = `${getVariedPromptPrefixes()}

RANDOMIZED QUESTION GENERATION - ${difficulty.toUpperCase()} LEVEL:
- Generate fresh, challenging questions at ${difficulty} difficulty
- Ensure maximum variety and avoid repetition
- Diversity Seed: ${diversitySeeds[0]}

${getContextualVariations(contextInfo)}

Create 3-4 general questions and 3-4 ${roleCategory === 'tech' ? 'technical' : 'role-specific'} questions appropriate for ${difficulty} level candidates.`;

    const systemDesignPrompt = `${getVariedPromptPrefixes()}

ADVANCED ${roleCategory === 'content' ? 'CONTENT STRATEGY' : 'SYSTEM DESIGN'} CHALLENGES - ${difficulty.toUpperCase()}:
- Create complex, thought-provoking scenarios
- Focus on strategic thinking and problem-solving
- Diversity Seed: ${diversitySeeds[1]}

${getContextualVariations(contextInfo)}

Generate 2-3 challenging ${roleCategory === 'content' ? 'content strategy questions' : 'system design questions'} for ${difficulty} level assessment.`;

    const challengesPrompt = `${getVariedPromptPrefixes()}

PRACTICE CHALLENGES - ${difficulty.toUpperCase()} COMPLEXITY:
- Design challenging, real-world scenarios
- Test advanced skills and decision-making
- Diversity Seed: ${diversitySeeds[2]}

${getContextualVariations(contextInfo)}

Create 2-3 advanced ${roleCategory === 'content' ? 'writing challenges' : 'coding challenges'} suitable for ${difficulty} level evaluation.`;

    const machineCodingPrompt = `${getVariedPromptPrefixes()}

COMPLEX PROJECT SCENARIO - ${difficulty.toUpperCase()}:
- Design a sophisticated, multi-faceted project
- Include advanced requirements and constraints
- Diversity Seed: ${diversitySeeds[3]}

${getContextualVariations(contextInfo)}

Create a comprehensive ${roleCategory === 'content' ? 'content project' : 'machine coding project'} that challenges ${difficulty} level candidates.`;

    try {
        // Sequential execution with delays for maximum diversity
        const questionsResult = await generateAndParse(questionsPrompt, questionsSchema, 2, 'random-questions');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const systemDesignResult = await generateAndParse(systemDesignPrompt, systemDesignQuestionsSchema, 2, 'system-design');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const codingChallengesResult = await generateAndParse(challengesPrompt, codingChallengesSchema, 2, 'random-challenges');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const machineCodingResult = await generateAndParse(machineCodingPrompt, machineCodingSchema, 2, 'random-machine');

        return {
            roleCategory,
            generalQuestions: questionsResult.generalQuestions || [],
            technicalQuestions: questionsResult.technicalQuestions || [],
            systemDesignQuestions: systemDesignResult || [],
            codingChallenges: codingChallengesResult || [],
            machineCoding: machineCodingResult || {}
        };

    } catch (error) {
        throw handleApiError(error, 'generateRandomizedPrepSet');
    }
};

/**
 * Generates machine coding solution guide
 */
export const generateMachineCodingSolution = async (
    problemTitle: string, 
    problemDescription: string
): Promise<MachineCodingSolution> => {
    if (!problemTitle?.trim() || !problemDescription?.trim()) {
        throw new Error("Both problem title and description are required");
    }

    const { sessionMarker } = generateUniqueMarkers();

    const prompt = `${getVariedPromptPrefixes()}

SOLUTION DESIGN SESSION: ${sessionMarker}

Problem Analysis:
Title: ${problemTitle}
Description: ${problemDescription}

Create a comprehensive, step-by-step solution guide with proper markdown formatting. Include implementation approach, key considerations, and best practices specific to this problem.`;

    try {
        const result = await generateAndParse(prompt, machineCodingSolutionSchema, 2, 'solution');
        return result as MachineCodingSolution;
    } catch (error) {
        throw handleApiError(error, 'generateMachineCodingSolution');
    }
};

/**
 * Generates company insights using Google Search
 */
export const generateCompanyInsights = async (companyName: string): Promise<CompanyInsights> => {
    if (!companyName?.trim()) {
        throw new Error("Company name is required");
    }

    const { sessionMarker } = generateUniqueMarkers();
    const promptPrefix = getVariedPromptPrefixes();

    const prompt = `${promptPrefix}

COMPANY RESEARCH SESSION: ${sessionMarker}
Target Company: "${companyName}"

Generate a comprehensive company research briefing for interview preparation with these sections:

### Company Culture & Values
### Recent News & Developments  
### Core Tech Stack or Tools

Focus on current, interview-relevant information and unique insights about this specific company.`;
    
    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: prompt }],
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.8,
            },
        });

        if (!response.text) {
            throw new Error(`Unable to generate insights for "${companyName}"`);
        }

        const sources: GroundingSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || '',
            }))
            .filter((source: GroundingSource) => source.uri && source.title);

        return { 
            content: response.text, 
            sources 
        };

    } catch (error) {
        throw handleApiError(error, `generateCompanyInsights for "${companyName}"`);
    }
};

/**
 * Analyzes resume against job description
 */
export const analyzeResume = async (resume: string, jobDescription: string): Promise<ResumeAnalysis> => {
    if (!resume?.trim() || !jobDescription?.trim()) {
        throw new Error("Both resume and job description are required");
    }

    const { sessionMarker } = generateUniqueMarkers();
    const promptPrefix = getVariedPromptPrefixes();

    const prompt = `${promptPrefix}

RESUME ANALYSIS SESSION: ${sessionMarker}

**Job Description:**
${jobDescription}

**Resume:**
${resume}

Provide a thorough analysis with actionable insights. Be realistic with scoring and constructive with feedback.`;

    try {
        const result = await generateAndParse(prompt, resumeAnalysisSchema, 2, 'resume-analysis');
        return result as ResumeAnalysis;
    } catch (error) {
        throw handleApiError(error, 'analyzeResume');
    }
};

/**
 * Creates a new chat session
 */
export const createChat = (params: { model: string; config?: any }): Chat => {
    const client = getAiClient();
    return client.chats.create(params);
};