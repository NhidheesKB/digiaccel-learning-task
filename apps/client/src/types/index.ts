export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface ITask {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  dueDate: string;
  priority?: Priority;
  status?: TaskStatus;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  dueDate?: string;
  priority?: Priority;
  status?: TaskStatus;
}

export interface WeekSummary {
  weekKey: string;
  startDate: string;
  endDate: string;
  weekLabel: string;
  isCurrentWeek: boolean;
  openTasksCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  tasks: ITask[];
}

export interface PaginatedTasks {
  tasks: ITask[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}
