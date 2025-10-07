export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; 
  createdAt: string;
  updatedAt: string;
}

export type FilterType = 'all' | 'active' | 'completed' | 'overdue';
export type SortType = 'newest' | 'oldest' | 'priority' | 'alphabetical' | 'dueDate';