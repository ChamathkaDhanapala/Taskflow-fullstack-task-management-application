export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'newest' | 'oldest' | 'priority' | 'alphabetical';