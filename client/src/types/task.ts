export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notifications?: {
    enabled: boolean;
    remindedAt?: string;
  };
}

export type FilterType = "all" | "active" | "completed" | "overdue"| 'tag';
export type SortType =
  | "newest"
  | "oldest"
  | "priority"
  | "alphabetical"
  | "dueDate";
