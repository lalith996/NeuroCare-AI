import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../middleware/auth';
import { UserRole, Permission } from '../middleware/permissions';
import * as patientController from '../controllers/patient.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get assigned games - patient, caregiver, or admin can access
router.get(
  '/games',
  authorize(UserRole.PATIENT, UserRole.CAREGIVER, UserRole.ADMIN),
  patientController.getAssignedGames
);

// Upload document - requires upload permission
router.post(
  '/upload-document',
  requirePermission(Permission.UPLOAD_DOCUMENTS),
  patientController.uploadDocument
);

// Get documents - patient, caregiver, doctor, or admin can access
router.get(
  '/documents',
  authorize(UserRole.PATIENT, UserRole.CAREGIVER, UserRole.DOCTOR, UserRole.ADMIN),
  patientController.getDocuments
);

export default router;
