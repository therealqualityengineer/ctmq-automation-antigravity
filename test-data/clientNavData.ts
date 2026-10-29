export const clientNavData = {
  urls: {
    home: '/',
    temp: '/temp',
    client: '/client',
    clientNew: '/client/new',
    adminUsers: '/admin/users',
    login: '/login',
  },
  tabs: {
    expectedOrder: ['Home', 'Temp', 'Client', 'Admin'],
    home: 'Home',
    temp: 'Temp',
    client: 'Client',
    admin: 'Admin',
  },
  styles: {
    activeClassPattern: /border-blue-900.*text-blue-900/,
    inactiveClassPattern: /border-transparent.*text-slate-600/,
    addClientButtonClassPattern: /rounded-lg.*bg-blue-600.*text-white/,
  },
  headings: {
    client: 'Client',
    temp: 'Temp',
  },
  buttons: {
    addClient: /Add Client/i,
    addTemp: /Add Temp/i,
  },
  header: {
    logoAlt: 'CTMQ — Contractor & Talent Management',
    logoutText: 'Logout',
  },
};

