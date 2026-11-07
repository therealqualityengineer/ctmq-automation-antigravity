export const shiftsData = {
  routes: {
    shifts: '/admin/shifts',
    admin: '/admin',
    login: '/login',
  },
  pageHeading: 'Shifts',
  addButtonText: 'Add Shift Option',
  tableHeaders: ['#', 'Shift Name', 'Start Time', 'End Time', 'Default Shift'],
  defaultShiftOptions: {
    yes: 'Yes',
    no: 'No',
  },
  validationMessages: {
    nameRequired: 'Shift Name is required.',
    startTimeRequired: 'Start Time is required.',
    endTimeRequired: 'End Time is required.',
    duplicateConflict: 'A shift option with this name already exists.',
    createSuccess: 'Shift option added successfully.',
  },
  modal: {
    title: 'Creating Shift Option',
    namePlaceholder: 'e.g. Day Shift, Night Shift, Evening',
    saveButtonText: 'Save Shift',
    cancelButtonText: 'Cancel',
  },
  defaultShifts: [
    { name: '8D', startTime: '07:00 AM', endTime: '03:00 PM', isDefault: 'Yes' },
  ],
  testPayloads: {
    validNonDefault: {
      namePrefix: 'Day Shift QA-',
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      isDefault: false,
    },
    validDefault: {
      namePrefix: 'Night Shift QA-',
      startTime: '07:00 PM',
      endTime: '07:00 AM',
      isDefault: true,
    },
    duplicateName: '8D',
    duplicateNameCaseInsensitive: '8d',
    generate100CharName: (uniqueSuffix: string | number): string => {
      const prefix = `Shift-100-Char-Boundary-${uniqueSuffix}-`;
      return prefix.padEnd(100, 'S');
    },
  },
  viewports: {
    desktopLarge: { width: 1440, height: 900 },
    desktopStandard: { width: 1280, height: 800 },
    laptop: { width: 1024, height: 768 },
  },
};
