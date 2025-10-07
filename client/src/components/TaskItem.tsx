import React, { useState } from "react";
import type { Task } from '../types/task'; 

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onEdit(task.id, { title: trimmed });
    }
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <li className="bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
                autoFocus
              />
            ) : (
              <div className="flex items-center space-x-2">
                <span
                  className={`block truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
                  onDoubleClick={() => setIsEditing(true)}
                >
                  {task.title}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-400 hover:text-blue-500 transition-colors p-1"
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </li>
  );
};

export default TaskItem;