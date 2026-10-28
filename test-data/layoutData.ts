export const layoutData = {
  viewports: {
    ultrawide: { width: 2560, height: 1440 },
    desktopWide: { width: 1920, height: 1080 },
    desktopStandard: { width: 1440, height: 900 },
    desktopCompact: { width: 1280, height: 720 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
  urls: {
    home: '/',
    temp: '/temp',
    tempNew: '/temp/new',
    adminUsers: '/admin/users',
    adminUsersNew: '/admin/users/new',
    login: '/login',
  },
  thresholds: {
    legacyMaxWidthCap: 896,
    desktopContentMinWidth: 1200,
    headerLeftAnchorMaxX: 100,
    headerRightAnchorMinX: 1100,
  },
  labels: {
    logoAlt: 'CTMQ — Contractor & Talent Management',
    home: 'Home',
    temp: 'Temp',
    admin: 'Admin',
    userManager: 'User Manager',
    logout: 'Logout',
    userName: 'Real QA Engineer',
  },
  styles: {
    activeNavClassPattern: /border-blue-900/,
    activeSubmenuClassPattern: /bg-blue-900/,
    tableOverflowClass: 'overflow-x-auto',
  },
};
