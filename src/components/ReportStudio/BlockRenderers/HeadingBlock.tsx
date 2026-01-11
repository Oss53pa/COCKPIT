/**
 * Heading Block Component
 */

import React, { useState, useRef, useEffect } from 'react';
import { HeadingBlock as HeadingBlockType, ContentBlock } from '../../../types/reportStudio';

interface HeadingBlockProps {
  block: HeadingBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== block.content) {
      onChange({ content });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const sizeClasses: Record<number, string> = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  };

  const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;

  if (isEditing && isEditable) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-transparent border-b-2 border-primary focus:outline-none ${sizeClasses[block.level]} text-primary-900`}
      />
    );
  }

  return (
    <HeadingTag
      className={`${sizeClasses[block.level]} text-primary-900 cursor-text`}
      onDoubleClick={() => isEditable && setIsEditing(true)}
    >
      {block.content}
    </HeadingTag>
  );
};
