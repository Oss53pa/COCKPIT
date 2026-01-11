/**
 * Callout Block Component
 */

import React, { useState } from 'react';
import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { CalloutBlock as CalloutBlockType, ContentBlock } from '../../../types/reportStudio';

interface CalloutBlockProps {
  block: CalloutBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [title, setTitle] = useState(block.title || '');

  const variantStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-900',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      titleColor: 'text-green-900',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
    },
    tip: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: Lightbulb,
      iconColor: 'text-purple-500',
      titleColor: 'text-purple-900',
    },
  };

  const style = variantStyles[block.variant];
  const Icon = style.icon;

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== block.content || title !== block.title) {
      onChange({ content, title: title || undefined });
    }
  };

  if (isEditing && isEditable) {
    return (
      <div className={`${style.bg} ${style.border} border rounded-lg p-4`}>
        <div className="flex gap-3">
          <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre (optionnel)"
              className={`w-full bg-transparent border-b border-current mb-2 font-semibold ${style.titleColor} focus:outline-none`}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent resize-none focus:outline-none text-primary-700"
              rows={3}
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 cursor-text`}
      onDoubleClick={() => isEditable && setIsEditing(true)}
    >
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {block.title && (
            <h4 className={`font-semibold ${style.titleColor} mb-1`}>
              {block.title}
            </h4>
          )}
          <p className="text-primary-700">{block.content}</p>
        </div>
      </div>
    </div>
  );
};
