/**
 * List Block Component
 */

import React, { useState } from 'react';
import { ListBlock as ListBlockType, ContentBlock, ListItem } from '../../../types/reportStudio';

interface ListBlockProps {
  block: ListBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const ListBlock: React.FC<ListBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleItemChange = (itemId: string, newContent: string) => {
    const updateItems = (items: ListItem[]): ListItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, content: newContent };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };

    onChange({ items: updateItems(block.items) });
  };

  const renderItem = (item: ListItem, depth: number = 0) => {
    const isEditing = editingItemId === item.id;

    return (
      <li key={item.id} className="py-1">
        {isEditing && isEditable ? (
          <input
            type="text"
            value={item.content}
            onChange={(e) => handleItemChange(item.id, e.target.value)}
            onBlur={() => setEditingItemId(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingItemId(null)}
            className="w-full bg-transparent border-b border-primary focus:outline-none"
            autoFocus
          />
        ) : (
          <span
            className="cursor-text"
            onDoubleClick={() => isEditable && setEditingItemId(item.id)}
          >
            {item.content}
          </span>
        )}

        {item.children && item.children.length > 0 && (
          <ListContainer
            type={block.listType}
            items={item.children}
            depth={depth + 1}
            renderItem={renderItem}
          />
        )}
      </li>
    );
  };

  return (
    <ListContainer
      type={block.listType}
      items={block.items}
      depth={0}
      renderItem={renderItem}
    />
  );
};

interface ListContainerProps {
  type: 'bullet' | 'numbered';
  items: ListItem[];
  depth: number;
  renderItem: (item: ListItem, depth: number) => React.ReactNode;
}

const ListContainer: React.FC<ListContainerProps> = ({
  type,
  items,
  depth,
  renderItem,
}) => {
  const ListTag = type === 'numbered' ? 'ol' : 'ul';
  const listStyle = type === 'numbered'
    ? 'list-decimal'
    : depth === 0
      ? 'list-disc'
      : depth === 1
        ? 'list-circle'
        : 'list-square';

  return (
    <ListTag className={`${listStyle} ml-6 text-primary-700`}>
      {items.map((item) => renderItem(item, depth))}
    </ListTag>
  );
};
