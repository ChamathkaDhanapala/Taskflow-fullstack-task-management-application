import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { FormEvent } from "react";

interface Props {
  onAdd: (title: string, priority: 'low' | 'medium' | 'high') => void;
}

const TaskInput: React.FC<Props> = ({ onAdd }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setTitle("");
    setPriority('medium');
  };

  return (
    <form 
      onSubmit={submit} 
      style={{
        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
        padding: '20px 16px',
        marginBottom: '24px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        marginBottom: '16px'
      }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: `2px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '8px',
            backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            outline: 'none',
            fontSize: '16px',
            minHeight: '44px'
          }}
        />
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <label style={{
            fontSize: '14px',
            color: theme === 'dark' ? '#d1d5db' : '#6b7280',
            whiteSpace: 'nowrap'
          }}>
            Priority:
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              outline: 'none',
              fontSize: '16px',
              minHeight: '44px'
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={!title.trim()}
        style={{
          width: '100%',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          border: 'none',
          cursor: !title.trim() ? 'not-allowed' : 'pointer',
          opacity: !title.trim() ? 0.5 : 1,
          fontSize: '16px',
          fontWeight: '600',
          minHeight: '44px'
        }}
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskInput;