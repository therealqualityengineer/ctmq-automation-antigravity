import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const authData = {
  validUser: {
    username: process.env.Staffing_USERNAME || 'qaengineer',
    password: process.env.Staffing_PASSWORD || 'Varshini@99',
  },
  invalidUser: {
    username: 'invalid_user_antigravity@test.com',
    password: 'WrongPassword!',
  },
  inactiveUser: {
    username: 'inactive_staffing_user',
    password: 'Password123!',
  },
  nonExistentUser: {
    username: 'nonexistent_user_antigravity',
    password: 'AnyPassword123!',
  },
  branding: {
    logoAlt: 'CTMQ — Contractor & Talent Management',
    logoSrcSubpath: 'ctmq-logo.png',
  },
  messages: {
    invalidCredentials: 'Invalid username or password.',
    rateLimitExceeded: 'Too many attempts — try again in a minute.',
    serverError: 'Something went wrong. Please try again.',
    badRequest: 'Something about your request was invalid. Please check your entries and try again.',
    loggingInButton: 'Logging in…',
    loginButton: 'Log In',
  },
  viewports: {
    mobile: { width: 375, height: 667 },
    desktop: { width: 1280, height: 800 },
  },
  apiEndpoints: {
    login: '**/api/auth/login',
  },
};
