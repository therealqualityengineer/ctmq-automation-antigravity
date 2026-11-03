export const adminGeneralSettingsData = {
  cardTitle: 'GENERAL SETTINGS',
  subsectionTitle: 'General',
  settingItems: [
    'Certifications',
    'Specialties',
    'Shifts',
    'Order Types',
    'Status Options',
  ],
  itemRoutes: {
    'Certifications': /\/admin\/certifications$/,
    'Specialties': /\/admin\/specialties$/,
    'Shifts': /\/admin\/shifts$/,
    'Order Types': /\/admin\/order-types$/,
    'Status Options': /\/admin\/status-options$/,
  },
  urls: {
    admin: '/admin',
    adminUsers: '/admin/users',
    login: '/login',
  },
  styles: {
    cardBorderPattern: /border-slate-300/,
    cardRoundedPattern: /rounded-lg/,
    headerBgPattern: /bg-slate-200/,
    headerBorderPattern: /border-b/,
    linkTextColorPattern: /text-blue-600/,
    linkHoverPattern: /hover:underline/,
    linkPointerPattern: /cursor-pointer/,
  },
  viewports: {
    desktopLarge: { width: 1440, height: 900 },
    desktopStandard: { width: 1280, height: 800 },
    laptop: { width: 1024, height: 768 },
  },
};

