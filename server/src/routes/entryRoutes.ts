import { Router } from 'express';
import { createEntry, getEntriesByDate, deleteEntry } from '../controllers/entryController';

const router = Router();

router.post('/', createEntry);
router.get('/', getEntriesByDate);
router.delete('/:id', deleteEntry);

export default router;