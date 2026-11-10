import { InputJsonValue } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma.js';
import { CreateTaskDTO, UpdateTaskDTO, Priority, TaskStatus, WeekSummary, ITask, PaginatedTasks } from '../types/index.js';
import { startOfWeek } from 'date-fns';

export class TasksService {
  async getTasks(filters?: {
    search?: string;
    status?: TaskStatus;
    priority?: Priority;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedTasks> {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters?.startDate) {
        where.dueDate.gte = new Date(filters.startDate);
      }
      if (filters?.endDate) {
        where.dueDate.lte = new Date(filters.endDate);
      }
    }

    const [totalCount, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      tasks,
      page,
      limit,
      totalCount,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async getWeeklySummaries(options?: { search?: string; priority?: Priority; status?: TaskStatus }): Promise<WeekSummary[]> {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const pipeline: InputJsonValue[] = [];

    const match: any = {};
    if (options?.search) {
      match.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }
    if (options?.priority) {
      match.priority = options.priority;
    }
    if (options?.status) {
      match.status = options.status;
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$dueDate',
              unit: 'week',
              startOfWeek: 'monday',
            },
          },
          openTasksCount: {
            $sum: { $cond: [{ $ne: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          completedTasksCount: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          totalTasksCount: { $sum: 1 },
          tasks: {
            $push: {
              id: { $toString: '$_id' },
              title: '$title',
              description: '$description',
              dueDate: {
                $dateToString: {
                  date: '$dueDate',
                  format: '%Y-%m-%dT%H:%M:%S.%LZ',
                },
              },
              priority: '$priority',
              status: '$status',
              createdAt: {
                $dateToString: {
                  date: '$createdAt',
                  format: '%Y-%m-%dT%H:%M:%S.%LZ',
                },
              },
              updatedAt: {
                $dateToString: {
                  date: '$updatedAt',
                  format: '%Y-%m-%dT%H:%M:%S.%LZ',
                },
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          weekKey: { $dateToString: { date: '$_id', format: '%Y-%m-%d' } },
          startDate: {
            $dateToString: { date: '$_id', format: '%Y-%m-%dT%H:%M:%S.%LZ' },
          },
          endDate: {
            $dateToString: {
              date: {
                $dateAdd: {
                  startDate: '$_id',
                  unit: 'millisecond',
                  amount: 604799999,
                },
              },
              format: '%Y-%m-%dT%H:%M:%S.%LZ',
            },
          },
          weekLabel: {
            $concat: [
              { $dateToString: { date: '$_id', format: '%b %d' } },
              ' - ',
              {
                $dateToString: {
                  date: {
                    $dateAdd: {
                      startDate: '$_id',
                      unit: 'day',
                      amount: 6,
                    },
                  },
                  format: '%b %d, %Y',
                },
              },
            ],
          },
          isCurrentWeek: {
            $eq: ['$_id', { $date: currentWeekStart.toISOString() }],
          },
          openTasksCount: 1,
          completedTasksCount: 1,
          totalTasksCount: 1,
          tasks: 1,
        },
      }
    );

    return (await prisma.task.aggregateRaw({ pipeline })) as unknown as WeekSummary[];
  }

  async getTaskById(id: string): Promise<ITask | null> {
    return prisma.task.findUnique({
      where: { id },
    });
  }

  async createTask(dto: CreateTaskDTO): Promise<ITask> {
    return prisma.task.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        dueDate: new Date(dto.dueDate),
        priority: dto.priority || 'MEDIUM',
        status: dto.status || 'OPEN',
      },
    });
  }

  async updateTask(id: string, dto: UpdateTaskDTO): Promise<ITask> {
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.dueDate !== undefined) data.dueDate = new Date(dto.dueDate);
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.status !== undefined) data.status = dto.status;

    return prisma.task.update({
      where: { id },
      data,
    });
  }

  async deleteTask(id: string): Promise<ITask> {
    return prisma.task.delete({
      where: { id },
    });
  }

  async searchTasks(query: string, page = 1, limit = 20): Promise<PaginatedTasks> {
    return this.getTasks({ search: query, page, limit });
  }
}

export const tasksService = new TasksService();
