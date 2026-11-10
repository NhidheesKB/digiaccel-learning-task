import { ITask, WeekSummary, CreateTaskDTO, UpdateTaskDTO, PaginatedTasks } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

export const api = {
  async getWeeklySummaries(params?: { search?: string; priority?: string; status?: string }): Promise<WeekSummary[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/tasks/weeks?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch weekly summaries');
    const data = await res.json();
    return data.data;
  },

  async getTasks(params?: {
    search?: string;
    priority?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tasks: ITask[]; pagination: PaginatedTasks }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/tasks?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    return { tasks: data.data, pagination: data.pagination };
  },

  async searchTasks(
    queryText: string,
    page = 1,
    limit = 20
  ): Promise<{ tasks: ITask[]; pagination: PaginatedTasks }> {
    const query = new URLSearchParams({
      q: queryText,
      page: String(page),
      limit: String(limit),
    });
    const res = await fetch(`${API_BASE}/tasks/search?${query.toString()}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return { tasks: data.data, pagination: data.pagination };
  },

  async createTask(dto: CreateTaskDTO): Promise<ITask> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create task');
    }
    return data.data;
  },

  async updateTask(id: string, dto: UpdateTaskDTO): Promise<ITask> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update task');
    }
    return data.data;
  },

  async updateStatus(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'): Promise<ITask> {
    const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update status');
    }
    return data.data;
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete task');
    }
  },
};
