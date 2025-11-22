import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  calculateRiskScore,
  getRiskHistory,
} from '../controllers/risk-assessment.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Risk assessment routes
router.get('/patient/:patientCode', calculateRiskScore);
router.get('/patient/:patientCode/history', getRiskHistory);

export default router;
