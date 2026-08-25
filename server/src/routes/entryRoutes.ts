import { Router } from 'express';
import { createEntry, getEntriesByDate, updateEntry, deleteEntry, copyEntries } from '../controllers/entryController';

const router = Router();

router.post('/', createEntry);
router.get('/', getEntriesByDate);
router.put('/:id', updateEntry);
router.post('/copy', copyEntries);
router.delete('/:id', deleteEntry);

export default router;