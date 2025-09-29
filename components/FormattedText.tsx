/**
 * @fileoverview A powerful component that parses and renders a string with markdown-like formatting
 * into styled React components. It handles code blocks, headings, lists, bold text, inline code, and links.
 * @author Mitesh
 */

import React from 'react';
import CodeBlock from './CodeBlock';
import ExplainButton from './ExplainButton';

interface FormattedTextProps {
  /** The text string to format. Can contain markdown-like syntax. */
  text: string;
  /** The style to apply to unordered lists. */
  listStyle?: 'check' | 'arrow' | 'circle' | 'disc';
  /** If true, disables the "Explain this" button for all parsed text elements. */
  disableExplain?: boolean;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, listStyle = 'disc', disableExplain = false }) => {
  if (!text) return null;

  /**
   * Parses inline formatting within a single line of text (bold, inline code, links).
   * @param {string} line The line of text to parse.
   * @returns {React.ReactNode[]} An array of React nodes (strings, code, strong, a elements).
   */
  const parseInlineFormatting = (line: string) => {
    // Split the line by supported inline formatting markers, keeping the delimiters.
    const parts = line.split(/(`[^`]+`|\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

    return parts.map((part, index) => {
      if (!part) return null;
      // Handle inline code: `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-slate-700/60 text-cyan-300 font-mono text-sm rounded px-1.5 py-1 mx-0.5 ring-1 ring-slate-600/50">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Handle bold text: **bold**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      // Handle links: [text](url)
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const text = linkMatch[1];
        const url = linkMatch[2];
        return (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors decoration-blue-400/50 underline-offset-2">
            {text}
          </a>
        );
      }
      // Return plain text parts as they are.
      return part;
    });
  };

  const elements: React.ReactNode[] = [];
  // First, split the entire text by code blocks (```...```) to isolate them.
  const parts = text.split(/(```[\s\S]*?```)/g);
  let keyIndex = 0;

  for (const rawPart of parts) {
    if (rawPart.startsWith('```')) {
      // This part is a code block.
      const codeBlock = rawPart.slice(3, -3).trim();
      const lines = codeBlock.split('\n');
      const firstLine = lines[0].trim();
      // Heuristically determine the language from the first line.
      const languageMatch = firstLine.match(/^[a-zA-Z0-9]+$/);
      const language = languageMatch ? languageMatch[0].toLowerCase() : '';
      const code = language && firstLine.toLowerCase() === language ? lines.slice(1).join('\n').trim() : codeBlock;
      elements.push(
        <div className="my-6" key={`code-wrapper-${keyIndex}`}>
          <CodeBlock key={`code-${keyIndex}`} language={language} code={code} />
        </div>
      );
      keyIndex++;
    } else if (rawPart.trim()) {
      // This part is regular text containing paragraphs, lists, and headings.
      // Pre-process to fix common formatting issues where lists are not on new lines.
      const processedPart = rawPart.replace(/(\S) - /g, '$1\n- ');
      
      const lines = processedPart.split('\n');
      let listItems: {node: React.ReactNode, text: string}[] = [];
      let currentListType: 'ul' | 'ol' | null = null;
      let paragraphLines: string[] = [];

      // Helper to render any accumulated list items.
      const flushList = () => {
        if (listItems.length > 0) {
          const listElement = currentListType === 'ol'
            ? <ol key={`list-${keyIndex++}`} className="space-y-2 my-5 list-decimal list-inside pl-4">{listItems.map(item => item.node)}</ol>
            : <ul key={`list-${keyIndex++}`} className={`space-y-2 my-5 ${listStyle !== 'disc' ? `list-style-${listStyle} list-none` : 'list-disc list-inside pl-4'}`}>{listItems.map(item => item.node)}</ul>;
          elements.push(listElement);
          listItems = [];
        }
        currentListType = null;
      };

      // Helper to render any accumulated paragraph lines.
      const flushParagraphs = () => {
        if (paragraphLines.length > 0) {
          const paragraphText = paragraphLines.join('\n');
          elements.push(
            <div key={`p-wrapper-${keyIndex}`} className="relative group my-4">
                <p className="leading-relaxed text-justify">
                    {parseInlineFormatting(paragraphText)}
                </p>
                {!disableExplain && (
                    <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExplainButton text={paragraphText} />
                    </div>
                )}
            </div>
          );
          keyIndex++;
          paragraphLines = [];
        }
      };

      // Iterate through each line of the text part.
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        const headingMatch = trimmedLine.match(/^(#+)\s+(.*)/);
        const ulMatch = trimmedLine.match(/^[-*]\s+(.*)/);
        const olMatch = trimmedLine.match(/^\d+\.\s+(.*)/);
        
        if (headingMatch) {
            flushParagraphs();
            flushList();
            const level = headingMatch[1].length;
            const content = headingMatch[2];
            const HeadingTag = `h${Math.min(level, 4)}` as keyof JSX.IntrinsicElements;
            const classNames = {
              1: 'text-2xl sm:text-3xl font-bold text-white mt-10 mb-6',
              2: 'text-xl sm:text-2xl font-bold text-white mt-8 mb-5',
              3: 'text-lg sm:text-xl font-bold text-white mt-7 mb-4',
              default: 'text-lg font-bold text-slate-200 mt-6 mb-3'
            };
            const className = classNames[level as keyof typeof classNames] || classNames.default;
            elements.push(<HeadingTag key={`h-${keyIndex++}`} className={className}>{parseInlineFormatting(content)}</HeadingTag>);
        } else if (ulMatch || olMatch) {
            flushParagraphs();
            const isUl = !!ulMatch;
            const content = isUl ? ulMatch![1] : olMatch![1];
            const newType = isUl ? 'ul' : 'ol';
            
            if (currentListType !== newType) flushList();
            currentListType = newType;

            const liNode = (
                <li key={`li-${keyIndex}-${listItems.length}`} className={`${listStyle !== 'disc' ? 'flex items-start' : 'py-0.5'} relative group`}>
                    <span className="text-justify">{parseInlineFormatting(content)}</span>
                    {!disableExplain && (
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExplainButton text={content} />
                        </div>
                    )}
                </li>
            );
            listItems.push({ node: liNode, text: content });

        } else if (!trimmedLine) {
            // An empty line signifies the end of the current paragraph or list.
            flushParagraphs();
            flushList();
        } else {
            // This is a line of a paragraph.
            flushList();
            paragraphLines.push(line);
        }
      });
      // Flush any remaining items after the loop.
      flushParagraphs();
      flushList();
    }
  }

  return <div className="formatted-content max-w-none text-slate-300 leading-relaxed">{elements}</div>;
};

export default FormattedText;
