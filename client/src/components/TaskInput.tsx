import React, { useState } from 'react';
import { useTags } from '../hooks/useTags';
import { TagSelector } from './TagSelector';
import { useTheme } from '../contexts/ThemeContext';

interface TaskInputProps {
  onAdd: (title: string, priority: 'low' | 'medium' | 'high', dueDate?: string, tags?: string[]) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { tags } = useTags();
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), priority, dueDate || undefined, selectedTags);
      setTitle('');
      setPriority('medium');
      setDueDate('');
      setSelectedTags([]);
    }
  };

  // Theme-based styles
  const containerStyle = {
    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
    color: theme === 'dark' ? '#f9fafb' : '#111827',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    color: theme === 'dark' ? '#f9fafb' : '#111827'
  };

  const selectStyle = {
    padding: '8px 12px',
    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    color: theme === 'dark' ? '#f9fafb' : '#111827',
    outline: 'none'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: title.trim() ? 'pointer' : 'not-allowed',
    opacity: title.trim() ? 1 : 0.5
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          style={selectStyle}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={selectStyle}
        />
      </div>

      {/* Tag Selector */}
      <TagSelector
        availableTags={tags}
        selectedTagIds={selectedTags}
        onTagsChange={setSelectedTags}
        maxTags={3}
      />

      <button
        type="submit"
        disabled={!title.trim()}
        style={buttonStyle}
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskInput;