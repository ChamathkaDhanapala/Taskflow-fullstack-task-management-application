import { useState, useEffect } from 'react';
import type { Tag } from '../types/task';

const defaultTags: Tag[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#10b981' },
  { id: 'urgent', name: 'Urgent', color: '#ef4444' },
  { id: 'shopping', name: 'Shopping', color: '#f59e0b' },
  { id: 'health', name: 'Health', color: '#8b5cf6' },
  { id: 'ideas', name: 'Ideas', color: '#06b6d4' }
];

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    // Load tags from localStorage or use defaults
    const savedTags = localStorage.getItem('taskflow-tags');
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    } else {
      setTags(defaultTags);
      localStorage.setItem('taskflow-tags', JSON.stringify(defaultTags));
    }
  }, []);

  const getTagById = (id: string): Tag | undefined => {
    return tags.find(tag => tag.id === id);
  };

  const getTagsByIds = (tagIds: string[]): Tag[] => {
    return tagIds.map(id => getTagById(id)).filter(Boolean) as Tag[];
  };

  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tag,
      id: Math.random().toString(36).substr(2, 9)
    };
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    localStorage.setItem('taskflow-tags', JSON.stringify(updatedTags));
    return newTag;
  };

  return {
    tags,
    getTagById,
    getTagsByIds,
    addTag
  };
};