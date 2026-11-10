import { Router } from 'express';
import { tasksController } from '../controllers/tasks.controller.js';

const router = Router();

router.get('/weeks', (req, res) => tasksController.getWeeks(req, res));
router.get('/search', (req, res) => tasksController.search(req, res));
router.get('/', (req, res) => tasksController.getAll(req, res));
router.get('/:id', (req, res) => tasksController.getById(req, res));
router.post('/', (req, res) => tasksController.create(req, res));
router.put('/:id', (req, res) => tasksController.update(req, res));
router.patch('/:id/status', (req, res) => tasksController.updateStatus(req, res));
router.delete('/:id', (req, res) => tasksController.delete(req, res));

export default router;
