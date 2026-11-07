import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface UserDetailPayload {
  fullName: string;
  username: string;
  title: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  isActive: boolean;
  role?: string;
}

export const userDetailData = {
  urls: {
    userManager: '/admin/users',
    userDetailPrefix: '/admin/users/',
    apiUsers: '/api/admin/users',
    apiAuthMe: '/api/auth/me',
  },
  headings: {
    viewUser: 'View User',
    editUser: 'Edit User',
  },
  roles: {
    defaultRole: 'Staffing Admin',
  },
  statuses: {
    active: 'active' as const,
    inactive: 'inactive' as const,
    activeDisplay: 'Active',
    inactiveDisplay: 'Inactive',
  },
  messages: {
    userSavedSuccess: 'User saved successfully.',
    userDeletedSuccess: 'User deleted successfully.',
    cannotDeactivateSelf: 'You cannot deactivate your own account.',
    cannotDeleteSelf: 'You cannot delete your own account.',
    usernameAlreadyInUse: 'That username is already in use.',
    emailAlreadyInUse: 'That email address is already in use.',
    fullNameRequired: 'The Full Name field is required.',
  },
  modal: {
    title: 'Delete User',
    prompt: "Are you sure? This can't be undone.",
    cancelButton: 'Cancel',
    confirmButton: 'Delete',
  },
  adminUser: {
    id: 1,
    username: process.env.Staffing_USERNAME || 'qaengineer',
  },
  generateUser: (prefix: string = 'usr') => {
    const uniqueId = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      fullName: `Test User ${uniqueId}`,
      username: `u_${uniqueId}`.slice(0, 30),
      title: 'Staffing Coordinator',
      email: `${uniqueId}@example.com`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      isActive: true,
      role: 'Staffing Admin',
    };
  },
};
