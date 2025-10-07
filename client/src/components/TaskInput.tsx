import React, { useState } from "react";
import type { FormEvent } from "react"; 

interface Props {
  onAdd: (title: string, priority: 'low' | 'medium' | 'high') => void;
}

const TaskInput: React.FC<Props> = ({ onAdd }) => {
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
    <form onSubmit={submit} className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex gap-3 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskInput;