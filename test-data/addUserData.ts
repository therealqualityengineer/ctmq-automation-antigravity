import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const addUserData = {
  urls: {
    addUser: '/admin/users/new',
    userManager: '/admin/users',
    login: '/login',
    apiUsers: '/api/admin/users',
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
    userCreatedSuccess: 'User created successfully.',
    usernameAlreadyInUse: 'That username is already in use.',
    emailAlreadyInUse: 'That email address is already in use.',
    passwordMismatch: 'Password and Confirm Password must match.',
  },
  existingUsers: {
    adminUsername: process.env.Staffing_USERNAME || 'qaengineer',
    adminEmail: 'therealqualityengineer@gmail.com',
  },
  defaultPassword: 'TempPassword123!',
  invalidEmails: [
    'invalid-email',
    'user@',
    '@example.com',
    'plainaddress',
  ],
  boundaryLengths: {
    longName: 'A'.repeat(255),
    longTitle: 'B'.repeat(150),
    longUsername: 'u'.repeat(100),
  },
  generateUser: (prefix: string = 'user') => {
    const uniqueId = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      fullName: `Test User ${uniqueId}`,
      username: `u_${uniqueId}`.slice(0, 30),
      title: 'Staffing Specialist',
      email: `${uniqueId}@example.com`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };
  },
};
