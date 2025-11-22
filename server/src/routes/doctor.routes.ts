import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../middleware/auth';
import { UserRole, Permission } from '../middleware/permissions';
import * as doctorController from '../controllers/doctor.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get patients - requires doctor or admin role
router.get(
  '/patients',
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  doctorController.getMyPatients
);

// Assign games - requires specific permission
router.post(
  '/assign-games',
  requirePermission(Permission.ASSIGN_GAMES),
  doctorController.assignGames
);

// Get patient scores - requires doctor, admin, or caregiver with permission
router.get(
  '/patients/:patientCode/scores',
  authorize(UserRole.DOCTOR, UserRole.ADMIN, UserRole.CAREGIVER),
  doctorController.getPatientScores
);

export default router;
