export interface TodoList {
  id: string;
  name: string;
  icon: string;
  color: string;
  taskCount?: number;
}

export interface SubTask {
  id: string;
  name: string;
  done: boolean;
}

export interface Task {
  id: string;
  name: string;
  status: 'todo' | 'done';
  priority: 'high' | 'medium' | 'low' | 'none';
  listId: string;
  listName?: string;
  listColor?: string;
  listIcon?: string;
  dueDate: string | null;
  pinned: boolean;
  notes: string;
  subTasks: SubTask[];
  parentTaskId: string | null;
}
