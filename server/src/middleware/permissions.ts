// Role definitions
export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  CAREGIVER = 'caregiver'
}

// Permission definitions
export enum Permission {
  // Patient permissions
  VIEW_OWN_PROFILE = 'view_own_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',
  VIEW_OWN_GAMES = 'view_own_games',
  PLAY_GAMES = 'play_games',
  VIEW_OWN_SCORES = 'view_own_scores',
  UPLOAD_DOCUMENTS = 'upload_documents',
  VIEW_OWN_REPORTS = 'view_own_reports',

  // Caregiver permissions
  VIEW_ASSIGNED_PATIENTS = 'view_assigned_patients',
  VIEW_PATIENT_PROGRESS = 'view_patient_progress',
  VIEW_PATIENT_REPORTS = 'view_patient_reports',
  SEND_MESSAGES = 'send_messages',

  // Doctor permissions
  MANAGE_PATIENTS = 'manage_patients',
  ASSIGN_GAMES = 'assign_games',
  VIEW_ALL_SCORES = 'view_all_scores',
  GENERATE_REPORTS = 'generate_reports',
  RUN_PREDICTIONS = 'run_predictions',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_CAREGIVERS = 'manage_caregivers',

  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_DOCTORS = 'manage_doctors',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_SYSTEM_ANALYTICS = 'view_system_analytics',
  MANAGE_ROLES = 'manage_roles',
  ACCESS_AUDIT_LOGS = 'access_audit_logs',
}

// Role-Permission mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.PATIENT]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_OWN_GAMES,
    Permission.PLAY_GAMES,
    Permission.VIEW_OWN_SCORES,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_OWN_REPORTS,
  ],

  [UserRole.CAREGIVER]: [
    // Caregiver has patient permissions plus additional ones
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_ASSIGNED_PATIENTS,
    Permission.VIEW_PATIENT_PROGRESS,
    Permission.VIEW_PATIENT_REPORTS,
    Permission.SEND_MESSAGES,
  ],

  [UserRole.DOCTOR]: [
    // Doctor has full patient management permissions
    Permission.VIEW_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.MANAGE_PATIENTS,
    Permission.ASSIGN_GAMES,
    Permission.VIEW_ALL_SCORES,
    Permission.GENERATE_REPORTS,
    Permission.RUN_PREDICTIONS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_CAREGIVERS,
  ],

  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission),
  ],
}

// Helper function to check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) || false
}

// Helper function to check if a role has any of the specified permissions
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission))
}

// Helper function to check if a role has all of the specified permissions
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission))
}

// Helper function to get all permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissions[role] || []
}

// Helper function to validate role
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole)
}
