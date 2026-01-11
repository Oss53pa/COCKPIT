/**
 * Paragraph Block Component
 */

import React, { useState, useRef, useEffect } from 'react';
import { ParagraphBlock as ParagraphBlockType, ContentBlock } from '../../../types/reportStudio';

interface ParagraphBlockProps {
  block: ParagraphBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== block.content) {
      onChange({ content });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const getAlignmentClass = () => {
    switch (block.formatting?.alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      case 'justify': return 'text-justify';
      default: return 'text-left';
    }
  };

  if (isEditing && isEditable) {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full p-2 border border-primary-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary ${getAlignmentClass()}`}
        style={{
          fontSize: block.formatting?.fontSize ? `${block.formatting.fontSize}px` : undefined,
          color: block.formatting?.color,
          backgroundColor: block.formatting?.backgroundColor,
          fontWeight: block.formatting?.bold ? 'bold' : undefined,
          fontStyle: block.formatting?.italic ? 'italic' : undefined,
          textDecoration: [
            block.formatting?.underline ? 'underline' : '',
            block.formatting?.strikethrough ? 'line-through' : '',
          ].filter(Boolean).join(' ') || undefined,
        }}
      />
    );
  }

  return (
    <p
      className={`text-primary-700 leading-relaxed cursor-text ${getAlignmentClass()}`}
      style={{
        fontSize: block.formatting?.fontSize ? `${block.formatting.fontSize}px` : undefined,
        color: block.formatting?.color,
        backgroundColor: block.formatting?.backgroundColor,
        fontWeight: block.formatting?.bold ? 'bold' : undefined,
        fontStyle: block.formatting?.italic ? 'italic' : undefined,
        textDecoration: [
          block.formatting?.underline ? 'underline' : '',
          block.formatting?.strikethrough ? 'line-through' : '',
        ].filter(Boolean).join(' ') || undefined,
      }}
      onDoubleClick={() => isEditable && setIsEditing(true)}
    >
      {block.content}
    </p>
  );
};
