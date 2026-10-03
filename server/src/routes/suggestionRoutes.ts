import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createSuggestions } from '../controllers/suggestionController';

const router = Router();

const suggestionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 5,
  message: { error: 'Too many requests, please wait a moment' },
});

router.post('/', suggestionLimiter, createSuggestions);

export default router;