import { Router } from 'express';
import { getGoals, upsertGoals } from '../controllers/goalController';

const router = Router();

router.get('/', getGoals);
router.put('/', upsertGoals);

export default router;