import React, { useState, useRef, useEffect } from 'react';
import type { Tag } from '../types/task';
import { TagBadge } from './TagBadge';
import { useTheme } from '../contexts/ThemeContext';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

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

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    padding: '12px'
  };

  const addButtonStyle = {
    padding: '6px 12px',
    fontSize: '14px',
    border: `1px dashed ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '16px',
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    background: 'none',
    cursor: 'pointer'
  };

  const emptyTextStyle = {
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    fontSize: '14px'
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
            style={addButtonStyle}
          >
            + Add Tag
          </button>
        )}
      </div>

      {isOpen && (
        <div style={dropdownStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
              <span style={emptyTextStyle}>
                All tags selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};