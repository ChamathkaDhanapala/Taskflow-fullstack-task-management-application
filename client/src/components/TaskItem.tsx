import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Task } from "../types/task";

interface Props {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Task>) => void;
    isDragging?: boolean;
}

const TaskItem: React.FC<Props> = ({
    task,
    onToggle,
    onDelete,
    onEdit,
    isDragging = false
}) => {
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [justCompleted, setJustCompleted] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    // Fade-in animation when task is created
    useEffect(() => {
        const timer = setTimeout(() => {
            if (itemRef.current) {
                itemRef.current.classList.add('fade-in');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const handleSave = () => {
        const trimmed = editTitle.trim();
        if (trimmed) {
            onEdit(task.id, { title: trimmed });
        }
        setIsEditing(false);
    };

    const handleToggle = () => {
        setJustCompleted(!task.completed);

        // Add completion animation
        if (!task.completed) {
            const timer = setTimeout(() => {
                onToggle(task.id);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            onToggle(task.id);
        }
    };

    const handleDelete = () => {
        if (itemRef.current) {
            itemRef.current.style.transform = 'translateX(-100%)';
            itemRef.current.style.opacity = '0';

            setTimeout(() => {
                onDelete(task.id);
            }, 300);
        } else {
            onDelete(task.id);
        }
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            high: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', darkBg: '#7f1d1d', darkText: '#fca5a5', darkBorder: '#991b1b' },
            medium: { bg: '#fffbeb', text: '#d97706', border: '#fed7aa', darkBg: '#78350f', darkText: '#fdba74', darkBorder: '#92400e' },
            low: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', darkBg: '#14532d', darkText: '#4ade80', darkBorder: '#15803d' }
        };

        const color = colors[priority as keyof typeof colors] || colors.medium;
        return theme === 'dark'
            ? { backgroundColor: color.darkBg, color: color.darkText, borderColor: color.darkBorder }
            : { backgroundColor: color.bg, color: color.text, borderColor: color.border };
    };

    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString();
        }
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date() && !task.completed;
    };

    const priorityStyle = getPriorityColor(task.priority);

    return (
        <div
            ref={itemRef}
            className={`task-item ${isDragging ? 'dragging' : ''}`}
            style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                borderBottom: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
                transition: 'all 0.3s ease-in-out',
                opacity: isDragging ? 0.6 : 1,
                transform: isDragging ? 'rotate(3deg)' : 'none'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {/* Drag Handle */}
                    <div
                        style={{
                            cursor: 'grab',
                            padding: '8px 4px',
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            userSelect: 'none',
                            fontSize: '16px',
                            touchAction: 'none' 
                        }}
                        onMouseDown={(e) => e.preventDefault()} 
                        onTouchStart={(e) => e.stopPropagation()} 
                    >
                        ⋮⋮
                    </div>

                    <div
                        className={justCompleted && !task.completed ? 'checkmark-animation' : ''}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={handleToggle}
                            style={{
                                height: '20px',
                                width: '20px',
                                color: '#3b82f6',
                                border: `2px solid ${theme === 'dark' ? '#6b7280' : '#d1d5db'}`,
                                borderRadius: '50%',
                                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {isEditing ? (
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: `2px solid #3b82f6`,
                                    borderRadius: '8px',
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                                    outline: 'none',
                                    transition: 'all 0.2s ease-in-out'
                                }}
                                autoFocus
                            />
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <span
                                    style={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed
                                            ? (theme === 'dark' ? '#6b7280' : '#9ca3af')
                                            : (theme === 'dark' ? '#f9fafb' : '#111827'),
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                    onDoubleClick={() => setIsEditing(true)}
                                >
                                    {task.title}
                                </span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        borderRadius: '12px',
                                        border: '1px solid',
                                        transition: 'all 0.2s ease-in-out',
                                        ...priorityStyle
                                    }}>
                                        {task.priority}
                                    </span>
                                    {task.dueDate && (
                                        <span style={{
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            transition: 'all 0.2s ease-in-out',
                                            backgroundColor: isOverdue(task.dueDate)
                                                ? (theme === 'dark' ? '#7f1d1d' : '#fef2f2')
                                                : (theme === 'dark' ? '#1e3a8a' : '#eff6ff'),
                                            color: isOverdue(task.dueDate)
                                                ? (theme === 'dark' ? '#fca5a5' : '#dc2626')
                                                : (theme === 'dark' ? '#93c5fd' : '#2563eb'),
                                            borderColor: isOverdue(task.dueDate)
                                                ? (theme === 'dark' ? '#991b1b' : '#fecaca')
                                                : (theme === 'dark' ? '#1e40af' : '#dbeafe')
                                        }}>
                                            {isOverdue(task.dueDate) ? '⚠️ ' : ''}
                                            {formatDueDate(task.dueDate)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        style={{
                            color: theme === 'dark' ? '#9ca3af' : '#d1d5db',
                            padding: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        className="pulse-once"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = theme === 'dark' ? '#3b82f6' : '#2563eb';
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#d1d5db';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Edit task"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            color: theme === 'dark' ? '#9ca3af' : '#d1d5db',
                            padding: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        className="pulse-once"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#7f1d1d' : '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#d1d5db';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Delete task"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;