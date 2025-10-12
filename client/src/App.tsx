import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import TaskInput from "./components/TaskInput";
import AnimatedTaskList from "./components/AnimatedTaskList";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import type { Task, FilterType, SortType } from "./types/task";
import { taskApi } from "./services/taskApi";
import { notificationService } from "./services/notificationService";
import { useTags } from './hooks/useTags';

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const { tags } = useTags();

  // Load tasks when user is authenticated
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  useEffect(() => {
    if (user && tasks.length > 0) {
      notificationService.startDeadlineChecker(tasks, 5 * 60 * 1000);
    }

    return () => {
      notificationService.stopDeadlineChecker();
    };
  }, [tasks, user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await taskApi.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string, priority: 'low' | 'medium' | 'high', dueDate?: string, tags: string[] = []) => {
    try {
      const newTask = await taskApi.createTask(title, priority, dueDate, tags);
      setTasks((prev) => [newTask, ...prev]);

      if (dueDate) {
        setTimeout(() => {
          notificationService.checkTaskDeadline(newTask);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const updatedTask = await taskApi.toggleTask(id);
      setTasks((prev) => prev.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const editTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskApi.updateTask(id, updates);
      setTasks((prev) => prev.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const clearCompleted = () => {
    const completedTasks = tasks.filter(task => task.completed);
    completedTasks.forEach(task => {
      deleteTask(task.id);
    });
  };

  const reorderTasks = (fromIndex: number, toIndex: number) => {
    setTasks(prev => {
      const newTasks = [...prev];
      const [movedTask] = newTasks.splice(fromIndex, 1);
      newTasks.splice(toIndex, 0, movedTask);
      return newTasks;
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'overdue') {
      return !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
    }
    if (filter === 'tag' && selectedTagFilter) {
      return task.tags.includes(selectedTagFilter);
    }
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    }
  });

  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '3rem',
            width: '3rem',
            borderBottom: '2px solid #3b82f6',
            margin: '0 auto'
          }}></div>
          <p style={{
            marginTop: '1rem',
            color: theme === 'dark' ? '#d1d5db' : '#6b7280'
          }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
        padding: '16px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
      padding: '16px 12px'
    }}>
      <div style={{
        maxWidth: '42rem',
        margin: '0 auto',
        width: '100%'
      }}>
        {/*  Header with User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                padding: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
                borderRadius: '4px',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px'
              }}
            >
              ☰
            </button>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: theme === 'dark' ? '#f9fafb' : '#111827'
            }}>
              TaskFlow
            </h1>
            <p style={{
              fontSize: '14px',
              color: theme === 'dark' ? '#d1d5db' : '#6b7280',
              margin: 0
            }}>
              Welcome, {user.name}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '6px',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px'
              }}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <p style={{
          color: theme === 'dark' ? '#d1d5db' : '#6b7280',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Manage your tasks efficiently
        </p>

        {/* Mobile Filters Menu */}
        {isMobileMenuOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'auto',
              marginBottom: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: theme === 'dark' ? '#f9fafb' : '#111827'
                }}>
                  Filters & Sort
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    cursor: 'pointer',
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme === 'dark' ? '#d1d5db' : '#374151',
                    marginBottom: '8px'
                  }}>
                    Filter:
                  </label>
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value as FilterType);
                      if (e.target.value !== 'tag') {
                        setSelectedTagFilter(null);
                      }
                    }}
                    style={{
                      width: '100%',
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
                    <option value="all">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="tag">By Tag</option>
                  </select>
                </div>

                {/* Tag Filter - Only show when filter is 'tag' */}
                {filter === 'tag' && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: theme === 'dark' ? '#d1d5db' : '#374151',
                      marginBottom: '8px'
                    }}>
                      Select Tag:
                    </label>
                    <select
                      value={selectedTagFilter || ''}
                      onChange={(e) => setSelectedTagFilter(e.target.value || null)}
                      style={{
                        width: '100%',
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
                      <option value="">Select a tag...</option>
                      {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme === 'dark' ? '#d1d5db' : '#374151',
                    marginBottom: '8px'
                  }}>
                    Sort by:
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortType)}
                    style={{
                      width: '100%',
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
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">Priority</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Responsive Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {[
            { value: tasks.length, label: 'Total', color: '#2563eb' },
            { value: activeTasksCount, label: 'Active', color: '#16a34a' },
            { value: completedTasksCount, label: 'Done', color: '#6b7280' }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                borderRadius: '8px',
                padding: '16px 8px',
                textAlign: 'center',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: stat.color
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '12px',
                color: theme === 'dark' ? '#d1d5db' : '#6b7280'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Task Input */}
        <TaskInput onAdd={addTask} />

        {/* Desktop Filters - Update this section too */}
        <div style={{
          display: 'none',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '500',
              color: theme === 'dark' ? '#d1d5db' : '#374151'
            }}>
              Filter:
            </label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as FilterType);
                if (e.target.value !== 'tag') {
                  setSelectedTagFilter(null);
                }
              }}
              style={{
                padding: '8px 12px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
                outline: 'none'
              }}
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="tag">By Tag</option>
            </select>
          </div>

          {filter === 'tag' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: theme === 'dark' ? '#d1d5db' : '#374151'
              }}>
                Tag:
              </label>
              <select
                value={selectedTagFilter || ''}
                onChange={(e) => setSelectedTagFilter(e.target.value || null)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '8px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  color: theme === 'dark' ? '#f9fafb' : '#111827',
                  outline: 'none'
                }}
              >
                <option value="">Select a tag...</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '500',
              color: theme === 'dark' ? '#d1d5db' : '#374151'
            }}>
              Sort by:
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
                outline: 'none'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div style={{ marginBottom: '24px' }}>
          <AnimatedTaskList
            tasks={sortedTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onReorder={reorderTasks}
          />
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <span style={{
            color: theme === 'dark' ? '#d1d5db' : '#6b7280',
            textAlign: 'center'
          }}>
            {activeTasksCount} task{activeTasksCount !== 1 ? 's' : ''} left
          </span>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={clearCompleted}
              disabled={completedTasksCount === 0}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: 'transparent',
                cursor: completedTasksCount === 0 ? 'not-allowed' : 'pointer',
                opacity: completedTasksCount === 0 ? 0.5 : 1,
                minHeight: '44px'
              }}
            >
              Clear Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;