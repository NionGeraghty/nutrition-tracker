import { Router } from 'express';
import { addEditor, removeEditor, getMyEditors, getWhoGaveMeAccess, getUnreciprocated } from '../controllers/editorController';

const router = Router();

router.post('/', addEditor);
router.delete('/:id', removeEditor);
router.get('/mine', getMyEditors);
router.get('/granted-to-me', getWhoGaveMeAccess);
router.get('/unreciprocated', getUnreciprocated);

export default router;