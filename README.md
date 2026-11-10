# To-Do List Mobile App

A weekly to-do list application built with React, Node.js, Express, MongoDB, and Prisma ORM.

## Features
- Tasks organized by week (Monday to Sunday)
- Week summary cards showing open and completed tasks
- Create, edit, and delete tasks
- Swipe left on tasks to delete
- Search tasks with debounced keyword search
- Status updates (Open, In Progress, Completed)
- Priority tags (Low, Medium, High)

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure `DATABASE_URL` has your MongoDB connection string.

3. Sync database schema and seed initial tasks:
   ```bash
   pnpm prisma:push
   pnpm seed
   ```

4. Run development:
   ```bash
   pnpm dev
   ```

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`

## Build
```bash
pnpm build
```
