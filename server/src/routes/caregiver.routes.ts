import { Router } from 'express';
import { authenticate, authorize, requirePermission } from '../middleware/auth';
import { UserRole, Permission } from '../middleware/permissions';

const router = Router();

// All caregiver routes require authentication and caregiver role
router.use(authenticate);
router.use(authorize(UserRole.CAREGIVER, UserRole.ADMIN));

// Get assigned patients
router.get(
  '/patients',
  requirePermission(Permission.VIEW_ASSIGNED_PATIENTS),
  (_req, res) => {
    // TODO: Implement get assigned patients for caregiver
    res.json({
      message: 'Get assigned patients',
      patients: [],
    });
  }
);

// Get patient progress
router.get(
  '/patients/:patientCode/progress',
  requirePermission(Permission.VIEW_PATIENT_PROGRESS),
  (_req, res) => {
    // TODO: Implement get patient progress
    res.json({
      message: 'Get patient progress',
      progress: {
        completedGames: 0,
        totalGames: 0,
        averageScore: 0,
        lastActivity: null,
      },
    });
  }
);

// Get patient reports (view only for caregivers)
router.get(
  '/patients/:patientCode/reports',
  requirePermission(Permission.VIEW_PATIENT_REPORTS),
  (_req, res) => {
    // TODO: Implement get patient reports for caregiver
    res.json({
      message: 'Get patient reports',
      reports: [],
    });
  }
);

// Send message to patient or doctor
router.post(
  '/messages',
  requirePermission(Permission.SEND_MESSAGES),
  (_req, res) => {
    // TODO: Implement send message
    res.json({
      message: 'Message sent successfully',
    });
  }
);

// Get caregiver's own messages
router.get('/messages', (_req, res) => {
  // TODO: Implement get messages
  res.json({
    messages: [],
  });
});

export default router;
