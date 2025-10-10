import React from 'react';
import type { Tag } from '../types/task';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: (tagId: string) => void;
  size?: 'small' | 'medium';
  clickable?: boolean;
  onClick?: (tag: Tag) => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ 
  tag, 
  onRemove, 
  size = 'medium',
  clickable = false,
  onClick 
}) => {
  const sizeStyles = {
    small: { padding: '4px 8px', fontSize: '12px' },
    medium: { padding: '6px 12px', fontSize: '14px' }
  };

  const style = {
    ...sizeStyles[size],
    backgroundColor: `${tag.color}20`,
    color: tag.color,
    border: `1px solid ${tag.color}40`,
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500' as const,
    cursor: clickable ? 'pointer' : 'default'
  };

  return (
    <span
      style={style}
      onClick={() => clickable && onClick?.(tag)}
      onKeyPress={(e) => clickable && e.key === 'Enter' && onClick?.(tag)}
      tabIndex={clickable ? 0 : -1}
    >
      #{tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
          style={{
            marginLeft: '4px',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};