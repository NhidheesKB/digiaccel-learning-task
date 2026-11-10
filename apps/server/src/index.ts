if (!process.env.VERCEL) {
  try {
    require('dotenv/config');
  } catch {}
}
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/tasks', tasksRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
