import React, { useState, useRef, useEffect } from 'react';
import type { Tag } from '../types/task';
import { TagBadge } from './TagBadge';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  maxTags?: number;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTagIds,
  onTagsChange,
  maxTags = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id));
  const availableTagsFiltered = availableTags.filter(tag => !selectedTagIds.includes(tag.id));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else if (selectedTagIds.length < maxTags) {
      onTagsChange([...selectedTagIds, tagId]);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        {selectedTags.map(tag => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => handleTagToggle(tag.id)}
            size="small"
          />
        ))}
        {selectedTagIds.length < maxTags && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              border: '1px dashed #d1d5db',
              borderRadius: '16px',
              color: '#6b7280',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            + Add Tag
          </button>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          padding: '12px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {availableTagsFiltered.map(tag => (
              <TagBadge
                key={tag.id}
                tag={tag}
                clickable
                onClick={() => handleTagToggle(tag.id)}
                size="small"
              />
            ))}
            {availableTagsFiltered.length === 0 && (
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                All tags selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};