import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.use(authenticate);

router.post('/generate/:patientCode', authorize('doctor'), reportController.generateReport);
router.get('/patient/:patientCode/latest', reportController.getLatestReport);

export default router;
