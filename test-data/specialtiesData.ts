export const specialtiesData = {
  routes: {
    specialties: '/admin/specialties',
    admin: '/admin',
    login: '/login',
  },
  pageHeading: 'Specialties',
  addButtonText: 'Add Specialty',
  tableHeaders: ['Specialty Name', 'Certification Mapping', 'Status'],
  status: {
    active: 'Active',
    inactive: 'Inactive',
  },
  validationMessages: {
    nameRequired: 'Specialty Name is required.',
    duplicateConflict: 'A specialty with this name already exists.',
    createSuccess: 'Specialty added successfully.',
    updateSuccess: 'Specialty updated successfully.',
    updateError: 'Failed to update specialty',
  },
  modal: {
    title: 'Add Specialty',
    editTitle: 'Edit Specialty',
    saveChangesButton: 'Save Changes',
    namePlaceholder: 'e.g. Intensive Care Unit',
    certDropdownDefault: 'Select certifications...',
  },
  defaultSpecialties: [
    { name: 'Cardiology', mapping: '-', status: 'Active' },
    { name: 'ER', mapping: 'RN', status: 'Active' },
    { name: 'Neurology', mapping: 'BLS', status: 'Active' },
  ],
  testPayloads: {
    validWithMapping: {
      namePrefix: 'Pediatrics-QA-',
      certifications: ['BLS', 'RN'],
      status: 'Active' as const,
    },
    validWithoutMapping: {
      namePrefix: 'Orthopedics-QA-',
      status: 'Active' as const,
    },
    inactiveSpecialty: {
      namePrefix: 'Radiology-QA-',
      certifications: ['RN'],
      status: 'Inactive' as const,
    },
    duplicateName: 'Cardiology',
    duplicateNameCaseInsensitive: 'cardiology',
    max100CharName: 'Specialty-Max-Boundary-Testing-String-With-Exactly-One-Hundred-Characters-For-Database-Validation-10',
    generate100CharName: (uniqueSuffix: string | number): string => {
      const prefix = `Specialty-100-Char-Boundary-${uniqueSuffix}-`;
      return prefix.padEnd(100, 'A');
    },
  },
  viewports: {
    desktopLarge: { width: 1440, height: 900 },
    desktopStandard: { width: 1280, height: 800 },
    laptop: { width: 1024, height: 768 },
  },
};
