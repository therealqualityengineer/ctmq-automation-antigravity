export const certificationsData = {
  routes: {
    certifications: '/admin/certifications',
    admin: '/admin',
    login: '/login',
  },
  pageHeading: 'Certifications',
  addButtonText: 'Add Certification',
  tableHeaders: ['Certification Name', 'Mapped Specialties', 'Status'],
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
  validationMessages: {
    nameRequired: 'Certification Name is required.',
    duplicateConflict: 'A certification with this name already exists.',
    createSuccess: 'Certification added successfully.',
  },
  modal: {
    title: 'Add Certification',
    namePlaceholder: 'e.g. BLS - Basic Life Support',
    specialtiesDropdownDefault: 'Select specialties...',
  },
  defaultCertifications: [
    { name: 'BLS', mapping: '-', status: 'Active' },
  ],
  testPayloads: {
    validWithMapping: {
      namePrefix: 'ACLS-QA-',
      specialties: ['Cardiology', 'ER'],
      status: 'Active' as const,
    },
    validWithoutMapping: {
      namePrefix: 'PALS-QA-',
      status: 'Inactive' as const,
    },
    validWithSingleMapping: {
      namePrefix: 'CPR-QA-',
      specialties: ['Cardiology'],
      status: 'Active' as const,
    },
    duplicateName: 'BLS',
    duplicateNameCaseInsensitive: 'bls',
    generate100CharName: (uniqueSuffix: string | number): string => {
      const prefix = `Cert-100-Char-Boundary-${uniqueSuffix}-`;
      return prefix.padEnd(100, 'A');
    },
  },
  viewports: {
    desktopLarge: { width: 1440, height: 900 },
    desktopStandard: { width: 1280, height: 800 },
    laptop: { width: 1024, height: 768 },
  },
};

