/**
 * Image Block Component
 */

import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ImageBlock as ImageBlockType, ContentBlock } from '../../../types/reportStudio';

interface ImageBlockProps {
  block: ImageBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const alignmentClass = block.alignment === 'center'
    ? 'mx-auto'
    : block.alignment === 'right'
      ? 'ml-auto'
      : '';

  if (!block.src) {
    return (
      <div
        className={`border-2 border-dashed border-primary-300 rounded-lg p-8 ${alignmentClass}`}
        style={{
          width: block.width || '100%',
          height: block.height || 200,
        }}
      >
        <div className="flex flex-col items-center justify-center h-full text-primary-400">
          <Upload className="w-12 h-12 mb-2" />
          <p className="text-sm">Aucune image</p>
          {isEditable && (
            <button className="mt-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">
              Ajouter une image
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <figure className={alignmentClass} style={{ maxWidth: block.width || '100%' }}>
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {hasError ? (
          <div
            className="flex flex-col items-center justify-center bg-primary-100 rounded-lg text-primary-400"
            style={{ height: block.height || 200 }}
          >
            <ImageIcon className="w-12 h-12 mb-2" />
            <p className="text-sm">Image non disponible</p>
          </div>
        ) : (
          <img
            src={block.src}
            alt={block.alt || ''}
            className={`rounded-lg ${isLoading ? 'invisible' : ''}`}
            style={{
              width: block.width || '100%',
              height: block.height || 'auto',
              objectFit: 'cover',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>

      {block.caption && (
        <figcaption className="text-sm text-primary-500 text-center mt-2 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
