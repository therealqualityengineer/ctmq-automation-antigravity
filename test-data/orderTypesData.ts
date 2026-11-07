export const orderTypesData = {
  routes: {
    orderTypes: '/admin/order-types',
    admin: '/admin',
    login: '/login',
  },
  pageHeading: 'Order Types',
  addButtonText: 'Add Order Type',
  tabs: {
    perDiem: 'Per Diem Order Types',
    longTerm: 'Long Term Order Types',
  },
  tableHeaders: {
    perDiem: ['#', 'Order Type Name', 'Status', 'Order Form Default'],
    longTerm: ['#', 'Order Type Name', 'Shift Order Type Default', 'Status', 'LT Order Form Default'],
  },
  status: {
    active: 'Active',
    hidden: 'Hidden',
  },
  defaultIndicators: {
    yes: 'Yes',
    no: 'No',
  },
  modal: {
    title: 'Order Type',
    subtitle: '* indicates required field',
    saveButtonText: 'Save Order Type',
    shiftOrderTypeDefaultPlaceholder: '(No order type)',
  },
  validationMessages: {
    nameRequired: 'Order Type Name is required.',
    duplicateConflict: 'An order type with this name already exists.',
    createSuccess: 'Order type added successfully.',
  },
  testPayloads: {
    perDiemValidDefault: {
      namePrefix: 'PD-QA-',
      status: 'Active' as const,
      isDefault: 'No' as const,
    },
    perDiemValidCustom: {
      namePrefix: 'PD-Custom-QA-',
      status: 'Hidden' as const,
      isDefault: 'Yes' as const,
    },
    longTermValid: {
      namePrefix: 'LT-QA-',
      status: 'Active' as const,
      isDefault: 'No' as const,
    },
    duplicateName: 'Standard Per Diem',
    duplicateNameCaseInsensitive: 'standard per diem',
    generate100CharName: (uniqueSuffix: string | number): string => {
      const prefix = `OT-100-Char-Boundary-${uniqueSuffix}-`;
      return prefix.padEnd(100, 'A');
    },
  },
  viewports: {
    desktopLarge: { width: 1440, height: 900 },
    desktopStandard: { width: 1280, height: 800 },
    laptop: { width: 1024, height: 768 },
  },
};
