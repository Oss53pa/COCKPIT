/**
 * Divider Block Component
 */

import React from 'react';
import { DividerBlock as DividerBlockType } from '../../../types/reportStudio';

interface DividerBlockProps {
  block: DividerBlockType;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ block }) => {
  const styleClass = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  }[block.style || 'solid'];

  return (
    <hr className={`border-t border-primary-300 my-6 ${styleClass}`} />
  );
};
