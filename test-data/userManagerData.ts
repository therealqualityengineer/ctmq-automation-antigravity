import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const userManagerData = {
  validUser: {
    username: process.env.Staffing_USERNAME || 'qaengineer',
    password: process.env.Staffing_PASSWORD || 'Varshini@99',
  },
  urls: {
    userManager: '/admin/users',
    login: '/login',
    adminUserDetailPrefix: '/admin/users/',
  },
  button: {
    name: 'Add User',
    ariaLabel: 'Add User',
    tailwindClasses: {
      bg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700',
      rounded: 'rounded-lg',
      paddingX: 'px-4',
      paddingY: 'py-2',
      font: 'font-semibold',
      textSize: 'text-sm',
      textColor: 'text-white',
    },
    styles: {
      backgroundColorPattern: /oklch\(0\.546.*262\.881\)|oklab\(0\.54.*-0\.24.*\)|rgb\(37,\s*99,\s*235\)/,
      hoverBackgroundColorPattern: /oklab\(0\.54.*-0\.24.*\)|oklch\(0\.488.*264\.376\)|rgb\(29,\s*78,\s*216\)/,
      colorPattern: /oklch\(1\s+0\s+0\)|rgb\(255,\s*255,\s*255\)/,
      borderRadius: '8px',
    },
  },
  navigation: {
    primaryNavItems: ['Home', 'Temp', 'Client', 'Admin'],
    adminSubNavItems: ['User Manager'],
  },
  table: {
    columns: ['Full Name', 'User Name', 'Title', 'Role', 'Status', 'Modified', 'E-Mail'],
  },
  search: {
    testQuery: 'qaengineer',
    nonExistentQuery: 'zzz-no-such-user-zzz',
  },
  messages: {
    noUsersFound: 'No users found.',
    userSavedSuccess: 'User saved successfully.',
    pageCountDefault: 'Page 1 of 1',
  },
  viewports: {
    desktop: { width: 1280, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
  apiEndpoints: {
    users: '**/api/users*',
  },
};
