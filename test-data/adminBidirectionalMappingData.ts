export const adminBidirectionalMappingData = {
  routes: {
    certifications: '/admin/certifications',
    specialties: '/admin/specialties',
    login: '/login',
  },
  tableHeaders: {
    certifications: ['CERTIFICATION NAME', 'MAPPED SPECIALTIES', 'STATUS'],
    specialties: ['SPECIALTY NAME', 'CERTIFICATION MAPPING', 'STATUS'],
  },
  fallbackPlaceholder: '-',
  baseEntities: {
    cardiology: 'Cardiology',
    er: 'ER',
    neurology: 'Neurology',
    bls: 'BLS',
    rn: 'RN',
  },
  status: {
    active: 'Active' as const,
    inactive: 'Inactive' as const,
  },
  generators: {
    generateCertName: (prefix = 'CERT-BIDI'): string =>
      `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    generateSpecName: (prefix = 'SPEC-BIDI'): string =>
      `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    generateLongName: (prefix = 'LONG-BIDI'): string =>
      `${prefix}-${Date.now()}-`.padEnd(60, 'X'),
  },
  viewports: {
    desktopLarge: { width: 1440, height: 900 },
    desktopStandard: { width: 1280, height: 800 },
    mobile: { width: 375, height: 667 },
  },
};
