import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../middleware/auth';
import { UserRole, Permission } from '../middleware/permissions';
import * as reportController from '../controllers/report.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate report - requires doctor or admin with permission
router.post(
  '/generate/:patientCode',
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  requirePermission(Permission.GENERATE_REPORTS),
  reportController.generateReport
);

// Get latest report - patient, caregiver, doctor, or admin can access
router.get(
  '/patient/:patientCode/latest',
  authorize(UserRole.PATIENT, UserRole.CAREGIVER, UserRole.DOCTOR, UserRole.ADMIN),
  reportController.getLatestReport
);

export default router;
