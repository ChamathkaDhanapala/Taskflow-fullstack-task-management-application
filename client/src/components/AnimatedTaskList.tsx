import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Task } from "../types/task";
import TaskItem from "./TaskItem";

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const AnimatedTaskList: React.FC<Props> = ({ tasks, onToggle, onDelete, onEdit, onReorder }) => {
  const { theme } = useTheme();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ index }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData("application/json");
      const { index: fromIndex } = JSON.parse(data);
      
      if (fromIndex !== dropIndex) {
        onReorder(fromIndex, dropIndex);
      }
    } catch (error) {
      console.error("Drag drop error:", error);
    }
    setDragOverIndex(null);
  };

  if (tasks.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 16px',
        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '500' }}>No tasks found</p>
        <p>Add a task above to get started!</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
      overflow: 'hidden'
    }}>
      <div>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            style={{
              border: dragOverIndex === index ? '2px dashed #3b82f6' : 'none',
              backgroundColor: dragOverIndex === index 
                ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                : 'transparent',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <TaskItem
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isDragging={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedTaskList;