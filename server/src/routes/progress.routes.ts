import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../middleware/permissions';
import {
  getPatientProgress,
  createProgressSnapshot,
  getProgressSnapshots,
  getComparativeAnalytics,
} from '../controllers/progress.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Progress tracking routes
router.get('/patient/:patientCode', getPatientProgress);
router.get('/patient/:patientCode/snapshots', getProgressSnapshots);
router.post('/patient/:patientCode/snapshot', authorize(UserRole.DOCTOR, UserRole.ADMIN), createProgressSnapshot);

// Doctor analytics
router.get('/comparative', authorize(UserRole.DOCTOR, UserRole.ADMIN), getComparativeAnalytics);

export default router;
