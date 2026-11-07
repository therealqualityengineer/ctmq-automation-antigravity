export const statusOptionsData = {
  routes: {
    statusOptions: '/admin/status-options',
    admin: '/admin',
    login: '/login',
  },
  addButtonText: 'Add Status Option',
  tabs: {
    client: 'Client',
    temp: 'Temp',
  },
  tableHeaders: ['#', 'STATUS NAME', 'STATUS DESCRIPTION', 'CURRENTLY ACTIVE'],
  status: {
    active: 'Active',
    inactive: 'Inactive',
    activeDisplay: 'Yes',
    inactiveDisplay: 'No',
  },
  validationMessages: {
    nameRequired: 'Status Option name is required.',
    duplicateConflictClient: 'A status option with this name already exists for Client.',
    duplicateConflictTemp: 'A status option with this name already exists for Temp.',
    createSuccess: 'Status option added successfully.',
  },
  modal: {
    title: 'Status Option',
    requiredSubtext: '* indicates required field',
    namePlaceholder: 'e.g. Active, Pending, Inactive',
    descriptionPlaceholder: 'Optional description',
  },
  defaultStatusOptions: {
    client: 'Active',
    temp: 'Active',
  },
  testPayloads: {
    clientOption: {
      namePrefix: 'Client-QA-',
      description: 'Test client status description',
      status: 'Active' as const,
    },
    tempOption: {
      namePrefix: 'Temp-QA-',
      description: 'Test temp status description',
      status: 'Active' as const,
    },
    inactiveOption: {
      namePrefix: 'Inactive-QA-',
      status: 'Inactive' as const,
    },
    duplicateName: 'Active',
    duplicateNameCaseInsensitive: 'active',
    generate100CharName: (uniqueSuffix: string | number): string => {
      const prefix = `Status-100-Char-${uniqueSuffix}-`;
      return prefix.padEnd(100, 'Z');
    },
    generate255CharDesc: (uniqueSuffix: string | number): string => {
      const prefix = `Status-255-Char-Desc-${uniqueSuffix}-`;
      return prefix.padEnd(255, 'D');
    },
  },
  viewports: {
    desktopLarge: { width: 1440, height: 900 },
    desktopStandard: { width: 1280, height: 800 },
    laptop: { width: 1024, height: 768 },
  },
};
