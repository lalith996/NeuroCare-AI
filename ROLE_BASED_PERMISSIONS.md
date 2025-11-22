# Role-Based Permissions System

## Overview

NeuroCare AI implements a comprehensive role-based access control (RBAC) system with four distinct roles and granular permissions.

## Roles

### 1. **Patient** 👤
The end user taking cognitive assessments.

**Permissions:**
- ✅ View own profile
- ✅ Update own profile
- ✅ View assigned games
- ✅ Play cognitive games
- ✅ View own scores
- ✅ Upload medical documents
- ✅ View own assessment reports

**API Endpoints:**
- `GET /api/patient/games` - View assigned games
- `POST /api/patient/upload-document` - Upload documents
- `GET /api/patient/documents` - View uploaded documents
- `GET /api/scores/my-scores` - View own scores

---

### 2. **Caregiver** 🤝
Family member or caretaker monitoring patient progress.

**Permissions:**
- ✅ All patient permissions
- ✅ View assigned patients
- ✅ View patient progress
- ✅ View patient reports (read-only)
- ✅ Send messages to doctors/patients

**API Endpoints:**
- `GET /api/caregiver/patients` - View assigned patients
- `GET /api/caregiver/patients/:code/progress` - View patient progress
- `GET /api/caregiver/patients/:code/reports` - View patient reports
- `POST /api/caregiver/messages` - Send messages
- `GET /api/caregiver/messages` - View messages

**Limitations:**
- ❌ Cannot assign games
- ❌ Cannot generate reports
- ❌ Cannot modify patient data
- ❌ Read-only access to patient information

---

### 3. **Doctor** 👨‍⚕️
Medical professional managing patients and assessments.

**Permissions:**
- ✅ All basic profile permissions
- ✅ Manage patients (add, view, update)
- ✅ Assign cognitive games to patients
- ✅ View all patient scores
- ✅ Generate assessment reports
- ✅ Run AI predictions
- ✅ View analytics dashboards
- ✅ Manage caregivers for their patients

**API Endpoints:**
- `GET /api/doctor/patients` - View all patients
- `POST /api/doctor/assign-games` - Assign games to patients
- `GET /api/doctor/patients/:code/scores` - View patient scores
- `POST /api/reports/generate/:code` - Generate reports
- `POST /api/predictions` - Run ML predictions
- `GET /api/doctor/analytics` - View analytics

**Capabilities:**
- ✅ Full patient management
- ✅ Clinical decision support
- ✅ Report generation
- ✅ Analytics access

---

### 4. **Admin** 👑
System administrator with full access.

**Permissions:**
- ✅ **ALL** permissions (complete system access)
- ✅ Manage all users
- ✅ Manage doctors and verify credentials
- ✅ Manage system settings
- ✅ View system-wide analytics
- ✅ Manage roles and permissions
- ✅ Access audit logs
- ✅ System configuration

**API Endpoints:**
- `GET /api/admin/users` - Manage all users
- `POST /api/admin/users` - Create users
- `PUT /api/admin/users/:id` - Update users
- `DELETE /api/admin/users/:id` - Delete users
- `GET /api/admin/doctors` - Manage doctors
- `POST /api/admin/doctors/:id/verify` - Verify doctors
- `GET /api/admin/settings` - System settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/audit-logs` - View audit logs
- `GET /api/admin/roles` - Manage roles
- `POST /api/admin/users/:id/role` - Change user roles

**Capabilities:**
- ✅ Complete system control
- ✅ User management
- ✅ System configuration
- ✅ Audit trail access

---

## Permission System

### How It Works

The system uses **both role-based and permission-based authorization**:

1. **Role-Based**: Routes can require specific roles
   ```typescript
   router.get('/patients', authorize(UserRole.DOCTOR, UserRole.ADMIN), handler);
   ```

2. **Permission-Based**: Routes can require specific permissions
   ```typescript
   router.post('/assign-games', requirePermission(Permission.ASSIGN_GAMES), handler);
   ```

3. **Flexible Access**: Multiple roles can access the same endpoint
   ```typescript
   router.get('/documents',
     authorize(UserRole.PATIENT, UserRole.CAREGIVER, UserRole.DOCTOR, UserRole.ADMIN),
     handler
   );
   ```

### Permission List

#### Patient Permissions
- `VIEW_OWN_PROFILE`
- `UPDATE_OWN_PROFILE`
- `VIEW_OWN_GAMES`
- `PLAY_GAMES`
- `VIEW_OWN_SCORES`
- `UPLOAD_DOCUMENTS`
- `VIEW_OWN_REPORTS`

#### Caregiver Permissions
- `VIEW_ASSIGNED_PATIENTS`
- `VIEW_PATIENT_PROGRESS`
- `VIEW_PATIENT_REPORTS`
- `SEND_MESSAGES`

#### Doctor Permissions
- `MANAGE_PATIENTS`
- `ASSIGN_GAMES`
- `VIEW_ALL_SCORES`
- `GENERATE_REPORTS`
- `RUN_PREDICTIONS`
- `VIEW_ANALYTICS`
- `MANAGE_CAREGIVERS`

#### Admin Permissions
- `MANAGE_USERS`
- `MANAGE_DOCTORS`
- `MANAGE_SYSTEM_SETTINGS`
- `VIEW_SYSTEM_ANALYTICS`
- `MANAGE_ROLES`
- `ACCESS_AUDIT_LOGS`

---

## Middleware Usage

### 1. Basic Authentication
```typescript
router.use(authenticate);
```
Validates JWT token and attaches user to request.

### 2. Role-Based Authorization
```typescript
router.use(authorize(UserRole.DOCTOR));
router.use(authorize(UserRole.DOCTOR, UserRole.ADMIN));
```
Allows only specified roles.

### 3. Permission-Based Authorization
```typescript
router.use(requirePermission(Permission.MANAGE_PATIENTS));
router.use(requirePermission(Permission.ASSIGN_GAMES, Permission.VIEW_ALL_SCORES));
```
Requires all specified permissions.

### 4. Any Permission
```typescript
router.use(requireAnyPermission(Permission.VIEW_ANALYTICS, Permission.VIEW_SYSTEM_ANALYTICS));
```
Requires at least one of the specified permissions.

---

## Examples

### Example 1: Doctor Assigning Games
```typescript
// Route definition
router.post('/assign-games',
  authenticate,
  requirePermission(Permission.ASSIGN_GAMES),
  doctorController.assignGames
);

// Only doctors and admins can assign games
```

### Example 2: Caregiver Viewing Progress
```typescript
// Route definition
router.get('/patients/:code/progress',
  authenticate,
  authorize(UserRole.CAREGIVER, UserRole.DOCTOR, UserRole.ADMIN),
  caregiverController.getPatientProgress
);

// Caregivers, doctors, and admins can view patient progress
```

### Example 3: Admin Only
```typescript
// Route definition
router.delete('/users/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  requirePermission(Permission.MANAGE_USERS),
  adminController.deleteUser
);

// Only admins can delete users
```

---

## Security Features

### 1. **Token-Based Authentication**
- JWT tokens with expiration
- Secure token storage
- Automatic token refresh

### 2. **Role Validation**
- Server-side role validation
- Cannot be bypassed by client
- Roles stored in database

### 3. **Permission Checks**
- Granular permission system
- Multiple permission levels
- Inheritable permissions

### 4. **Error Handling**
```json
{
  "error": "Insufficient permissions",
  "required": ["admin"],
  "current": "doctor"
}
```

---

## Frontend Integration

### Checking User Role
```typescript
import { useAuthStore } from '@/store/authStore';

const { user } = useAuthStore();

if (user?.role === 'doctor') {
  // Show doctor-specific UI
}
```

### Conditional Rendering
```typescript
{user?.role === 'admin' && (
  <AdminPanel />
)}

{['doctor', 'caregiver'].includes(user?.role) && (
  <PatientList />
)}
```

### API Calls with Role
```typescript
// Automatically includes role from JWT token
const response = await doctorAPI.getPatients();
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'caregiver')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Caregiver-Patient Association
```sql
CREATE TABLE caregiver_patients (
  id SERIAL PRIMARY KEY,
  caregiver_id INTEGER REFERENCES users(id),
  patient_id INTEGER REFERENCES users(id),
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(caregiver_id, patient_id)
);
```

---

## Best Practices

### 1. Always Authenticate First
```typescript
router.use(authenticate); // First
router.use(authorize(UserRole.DOCTOR)); // Then authorize
```

### 2. Use Least Privilege
Give users only the permissions they need.

### 3. Log Permission Checks
Track who accesses what for audit trails.

### 4. Validate on Backend
Never trust frontend role checks alone.

---

## Migration Guide

### Updating Existing Routes

**Before:**
```typescript
router.use(authorize('doctor'));
```

**After:**
```typescript
router.use(authorize(UserRole.DOCTOR));
```

### Adding New Permissions

1. Add to `Permission` enum in `permissions.ts`
2. Add to appropriate role in `rolePermissions`
3. Use in route:
   ```typescript
   router.get('/new-endpoint', requirePermission(Permission.NEW_PERMISSION), handler);
   ```

---

## Testing Permissions

### Test Cases
1. ✅ Patient cannot access doctor endpoints
2. ✅ Caregiver can view but not modify patient data
3. ✅ Doctor can manage patients
4. ✅ Admin has full access
5. ✅ Unauthenticated requests rejected
6. ✅ Invalid tokens rejected
7. ✅ Expired tokens rejected

---

## Summary

| Role | Access Level | Main Use Case |
|------|--------------|---------------|
| **Patient** | Own data only | Taking assessments |
| **Caregiver** | Assigned patients (read-only) | Monitoring loved ones |
| **Doctor** | All patients | Clinical management |
| **Admin** | Everything | System administration |

**Built with security and flexibility in mind! 🔐**
