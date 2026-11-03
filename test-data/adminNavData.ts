export const adminNavData = {
  urls: {
    admin: '/admin',
    adminUsers: '/admin/users',
    adminUsersNew: '/admin/users/new',
    login: '/login',
    home: '/',
  },
  tabs: {
    home: 'Home',
    temp: 'Temp',
    client: 'Client',
    admin: 'Admin',
    userManager: 'User Manager',
  },
  styles: {
    activeAdminNavPattern: /border-blue-900/,
    activeUserSubmenuPattern: /bg-blue-900/,
  },
  viewports: {
    desktop: { width: 1280, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
};

