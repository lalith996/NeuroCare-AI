import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserAchievements,
  getUserStreak,
  updateStreak,
  checkAchievements,
  getLeaderboard,
} from '../controllers/gamification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Achievement routes
router.get('/achievements', getUserAchievements);
router.post('/achievements/check', checkAchievements);

// Streak routes
router.get('/streak', getUserStreak);
router.post('/streak/update', updateStreak);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

export default router;
