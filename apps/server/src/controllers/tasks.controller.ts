import { Request, Response } from 'express';
import { tasksService } from '../services/tasks.service.js';
import { z } from 'zod';
import { Priority, TaskStatus } from '../types/index.js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(1000).optional().nullable(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for dueDate',
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format for dueDate',
    })
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export class TasksController {
  async getAll(req: Request, res: Response) {
    try {
      const { search, status, priority, startDate, endDate, page, limit } = req.query;
      const result = await tasksService.getTasks({
        search: search ? String(search) : undefined,
        status: status ? (String(status).toUpperCase() as TaskStatus) : undefined,
        priority: priority ? (String(priority).toUpperCase() as Priority) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.json({
        success: true,
        data: result.tasks,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      });
    } catch (error: any) {
      console.error('Error in getAll:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch tasks' });
    }
  }

  async getWeeks(req: Request, res: Response) {
    try {
      const { search, priority, status } = req.query;
      const summaries = await tasksService.getWeeklySummaries({
        search: search ? String(search) : undefined,
        priority: priority ? (String(priority).toUpperCase() as Priority) : undefined,
        status: status ? (String(status).toUpperCase() as TaskStatus) : undefined,
      });

      res.json({
        success: true,
        data: summaries,
      });
    } catch (error: any) {
      console.error('Error in getWeeks:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch weekly summaries' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const task = await tasksService.getTaskById(id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      res.json({ success: true, data: task });
    } catch (error: any) {
      console.error('Error in getById:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch task' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parseResult = createTaskSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: parseResult.error.errors.map((e) => e.message).join(', '),
        });
      }

      const task = await tasksService.createTask(parseResult.data);
      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error: any) {
      console.error('Error in create:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to create task' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const parseResult = updateTaskSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: parseResult.error.errors.map((e) => e.message).join(', '),
        });
      }

      const task = await tasksService.updateTask(id, parseResult.data);
      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error: any) {
      console.error('Error in update:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to update task' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { status } = req.body;

      if (!['OPEN', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be OPEN, IN_PROGRESS, or COMPLETED',
        });
      }

      const task = await tasksService.updateTask(id, { status });
      res.json({
        success: true,
        data: task,
        message: 'Task status updated',
      });
    } catch (error: any) {
      console.error('Error in updateStatus:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to update status' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const deleted = await tasksService.deleteTask(id);
      res.json({
        success: true,
        data: deleted,
        message: 'Task deleted successfully',
      });
    } catch (error: any) {
      console.error('Error in delete:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to delete task' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { q, page, limit } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0, hasMore: false },
        });
      }
      const result = await tasksService.searchTasks(q.trim(), Number(page) || 1, Number(limit) || 20);
      res.json({
        success: true,
        data: result.tasks,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      });
    } catch (error: any) {
      console.error('Error in search:', error);
      res.status(500).json({ success: false, error: error.message || 'Search failed' });
    }
  }
}

export const tasksController = new TasksController();
